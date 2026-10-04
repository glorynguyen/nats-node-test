import { connect } from "@nats-io/transport-node";

async function testNats() {
  try {
    // Connect to NATS running locally on port 4222
    const nc = await connect({ servers: "nats://localhost:4222" });
    console.log(`Connected to NATS server: ${nc.getServer()}`);

    const decoder = new TextDecoder();

    // 1. Subscribe to a subject
    const sub = nc.subscribe("demo.test");
    const subLoop = (async () => {
      for await (const msg of sub) {
        console.log(`[Received on '${msg.subject}']: ${decoder.decode(msg.data)}`);
      }
    })();

    // 2. Publish a message to the subject
    console.log("Publishing test message...");
    nc.publish("demo.test", new TextEncoder().encode("Hello NATS from Node.js!"));

    // 3. Gracefully drain and close the connection
    await nc.drain();
    console.log("Connection drained and closed successfully.");
  } catch (err) {
    console.error("Failed to connect to NATS:", err.message);
  }
}

testNats();