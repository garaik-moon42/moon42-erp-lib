const greeter = (person: string) => {
  return `Hello, ${person}!`;
}

function testGreeter() {
  const world = 'World';
  console.log(greeter(world));
}
