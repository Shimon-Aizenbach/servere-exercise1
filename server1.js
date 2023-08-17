const express = require(`express`);
const morgan = require(`morgan`);
const cors = require(`cors`);
const { v4: uuidv4 } = require("uuid");
const bcrypt = require(`bcrypt`);
const isemail = require(`isemail`);
const passwordValidator = require("password-validator");
const schema = new passwordValidator();
schema.is().min(8).has().uppercase().has().lowercase();

const myId = () => uuidv4();
const allIdAscending = [
  `8cec6301-bd35-48e7-b17d-5e0813a9ba5b`,
  `688152d5-0a75-4df8-ba0b-2a50fad4d27b`,
  `ff2def83-b3d7-4714-b533-c3c5cb7dd0cf`,
];

const data = [
  {
    id: allIdAscending[0],
    email: `123@123.123`,
    password: `Ea1112345`,
  },
  {
    id: allIdAscending[1],
    email: `1234@123.123`,
    password: `Ea1154321`,
  },
  {
    id: allIdAscending[2],
    email: `12345@123.123`,
    password: `Ea11112468`,
  },
];

const app = express();
const port = 3000;

app.listen(port, () => console.log(`I'm running`));
app.use(cors());
app.use(morgan(`tiny`));
app.use(express.json());

async function encryption(password) {
  try {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  } catch (err) {
    console.log(err);
  }
}

async function toEncryption() {
  for (const user of data) {
    user.password = await encryption(user.password);
  }
}
toEncryption();

app.get("/", (req, res) => {
  res.send(
    data.map(
      (user) =>
        `id: ${user.id}, email: ${user.email}, password: ${user.password}`
    )
  );
});

app.get("/:id", (req, res) => {
  const user = data.filter((user) => user.id === req.params.id)[0];
  res.send(`id: ${user.id}, email: ${user.email}, password: ${user.password}`);
});

app.post("/", async (req, res) => {
  const {email, password} = req.body;
  if (isemail.validate(email)) {
    if (schema.validate(password)) {  
      const newId = myId();
      const hashedPassword = await encryption(password);
      data.push({
        id: newId,
        email: email,
        password: hashedPassword,
      });
      console.log(...data);
      allIdAscending.push(newId);
      console.log(allIdAscending);
      res.send(`User created`);
    } else { 
      res
        .status(400)
        .send(
          `password must consist of at least one uppercase letter, one lowercase letter and eight characters`
        );
    }
  } else {
    res.status(400).send(`Email address is invalid`);
  }
});

app.put("/:id", async (req, res) => {
  const {email, password} = req.body;
  if (isemail.validate(email)) {
    if (schema.validate(password)) {
      const userIndex = data.findIndex((user) => user.id === req.params.id);
      data[userIndex].email = email;
      const hashedPassword = await encryption(password);
      data[userIndex].password = hashedPassword;
      console.log(data[userIndex]);
      res.send(`User has been edited`);
    } else {
      res
        .status(400)
        .send(
          `password must consist of at least one uppercase letter, one lowercase letter and eight characters`
        );
    }
  } else {
    res.status(400).send(`Email address is invalid`);
  }
});

app.delete("/:id", (req, res) => {
  const userIndex = data.findIndex((user) => user.id === req.params.id);
  data.splice(userIndex, 1);
  console.log(data);
  res.send(`User has been deleted`);
});

app.post("/user", async (req, res) => {
  try {
    const user = data.find((user) => user.email === req.body.email);
    user && (await bcrypt.compare(req.body.password, user.password))
      ? res.send(`User is connected`)
      : res.send(`wrong credentials`);
  } catch (err) {
    console.log(err);
  }
});
