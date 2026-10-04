import { connect } from "@nats-io/transport-node";

async function publishMessage() {
  const servers = process.env.NATS_URL || "nats://localhost:4222";
  const subject = process.env.NATS_SUBJECT || "demo.test";
  const message = process.argv.slice(2).join(" ") || "Hello from the NATS publisher!";
  let connection;

  try {
    connection = await connect({ servers });
    connection.publish(subject, new TextEncoder().encode(message));
    await connection.flush();
    console.log(`Published to '${subject}' on ${connection.getServer()}: ${message}`);
  } catch (err) {
    console.error("Failed to publish to NATS:", err.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

publishMessage();