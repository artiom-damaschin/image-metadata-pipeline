type User = {
  name: string;
  age: number;
};

const john = {
  name: "John",
  age: 33,
} satisfies User;

console.log(john);
