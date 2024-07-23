import { createClient } from "@supabase/supabase-js";
import r from "readline-sync";

const options = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionUrl: true,
  },
};

let supabase;
try {
  supabase = createClient(
    process.env.SUPABASE_DATABASE_URL,
    process.env.SUPABASE_PUBLIC_ANON_KEY,
    options
  );
  console.log("Supabase successfully connected.");
} catch (err) {
  console.log(err);
  process.exit(1);
}

const id = { email: "", username: "", password: "" };

Object.keys(id).forEach((key) => {
  if (key === "email") id[key] = r.questionEMail();
  else if (key === "password")
    id[key] = r.questionNewPassword("Input password: ", { min: 6 });
  else id[key] = r.question(`Input ${key}: `);
});

const payload = {
  email: id["email"],
  password: id["password"],
  options: {
    data: {
      username: id["username"],
    },
  },
};

const { data, error } = await supabase.auth.signUp(payload);

if (error) {
  console.log(error);
  process.exit(1);
} else {
  console.log(data);
  process.exit(0);
}
