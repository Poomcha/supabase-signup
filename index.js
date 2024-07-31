import { createClient } from "@supabase/supabase-js";
import r from "readline-sync";

const api = {
  db_url: process.env.SUPABASE_DATABASE_URL,
  service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

const options = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionUrl: true,
  },
};

if (process.argv.length > 3) {
  console.log("Argument unauthorized.");
  process.exit(1);
} else {
  if (process.argv.length === 3) {
    if (process.argv[2] === "dev") {
      api.db_url = process.env.SUPABASE_DATABASE_URL_DEV;
      api.service_role_key = process.env.SUPABASE_SERVICE_ROLE_KEY_DEV;
    } else {
      console.log("Argument unauthorized.");
      process.exit(1);
    }
  }
}

let supabase;
try {
  supabase = createClient(api.db_url, api.service_role_key, options);
  console.log("Supabase successfully connected in admin mode.");
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

const xsolla_payload = {
  username: id["email"],
  remember_me: false,
  password: id["password"],
};

const xsolla_res = await supabase.functions.invoke("registerXsollaUser", {
  body: xsolla_payload,
});

if (xsolla_res.error) {
  console.log("An error occured while registering user to XSolla.");
  console.log(xsolla_res.error);
  process.exit(1);
}

const payload = {
  email: id["email"],
  password: id["password"],
  user_metadata: {
    username: id["username"],
    xsolla: xsolla_res.data.id,
  },
  // options: {
  //   data: {
  //     username: id["username"],
  //     xsolla: xsolla_res.data.id,
  //   },
  // },
  email_confirm: true,
};

// const { data, error } = await supabase.auth.signUp(payload);

const { data, error } = await supabase.auth.admin.createUser(payload);

if (error) {
  console.log(error);
  process.exit(1);
} else {
  console.log(data);
  console.log(`User ${id["username"]} successfully  registered.`);
  process.exit(0);
}
