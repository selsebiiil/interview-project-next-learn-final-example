"use server";

import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { AuthError } from "next-auth";

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select a customer.",
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select an invoice status.",
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ date: true, id: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: "Database Error: Failed to Update Invoice." };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string, status: string) {
  // throw new Error('Failed to Delete Invoice');

  try {
    await sql`
    UPDATE invoices
    SET status = 'canceled'
    WHERE id = ${id}
    `;
    await addAuditLog(id, "canceled", status, "change");
    revalidatePath("/dashboard/invoices");
    return { message: "Canceled Invoice" };
  } catch (error) {
    return { message: "Database Error: Failed to Cancel Invoice." };
  }
}

export async function updateInvoiceStatus(id: string, newStatus: string) {
  // throw new Error('Failed to Delete Invoice');

  try {
    await sql`
    UPDATE invoices
    SET status = ${newStatus}
    WHERE id = ${id}
    `;
    revalidatePath("/dashboard/invoices");
    return { message: "Updated Invoice Status" };
  } catch (error) {
    return { message: "Database Error: Failed to Update Invoice Status" };
  }
}

export async function addAuditLog(
  id: string,
  newStatus: string,
  prevStatus: string,
  action_type: string
) {
  try {
    const session = await auth();
    await sql`
    INSERT INTO audit_logs (invoice_id, previous_status, new_status, changed_by, changed_at,action_type)
    VALUES (
      ${id}, 
      ${prevStatus}, 
      ${newStatus}, 
      ${session?.user?.id},
      NOW(),
      ${action_type}
    )
  `;
    revalidatePath("/dashboard/invoices");
    return { message: "Added Audit Log" };
  } catch (error) {
    return { message: "Database Error: Failed to Add Log." };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}
