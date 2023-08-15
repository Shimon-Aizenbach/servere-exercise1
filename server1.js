const express = require(`express`);
const morgan = require(`morgan`);
const cors = require(`cors`);
const { log } = require("console");

const data = [
  {
    id: 1,
    email: `123@123.123`,
    password: `12345`,
  },
  {
    id: 2,
    email: `1234@123.123`,
    password: `54321`,
  },
  {
    id: 3,
    email: `12345@123.123`,
    password: `2468`,
  },
];

const app = express();
const port = 3000;

app.listen(port, () => console.log(`I'm running`));
app.use(cors());
app.use(morgan(`tiny`));
app.use(express.json());
app.get("/", (req, res) => {
  res.send(
    data.map(
      (user) =>
        `id: ${user.id}, email: ${user.email}, password: ${user.password}`
    )
  );
});

app.get("/:id", (req, res) => {
  const user = data.filter((user) => user.id === Number(req.params.id))[0];
  res.send(`id: ${user.id}, email: ${user.email}, password: ${user.password}`);
});

app.post("/", (req, res) => {
  data.push({
    id: data.length + 1,
    email: req.body.email,
    password: req.body.password,
  });
  console.log(data[data.length - 1]);
  res.send(`User created`);
});

app.put("/:id", (req, res) => { 
  data[req.params.id - 1].email = req.body.email;
  data[req.params.id - 1].password = req.body.password;
  console.log(data[req.params.id - 1]);
  res.send(`User has been edited`);
});

app.delete("/:id", (req, res) => { 
    data[req.params.id - 1] = {};
    console.log(data[req.params.id - 1]);
    res.send(`User has been deleted`);
  });


