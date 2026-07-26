import { connectDB } from './db';
import { Event } from './models/Event';
import { MOCK_EVENTS } from './mock-data';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function testAndSeedConnections() {
  const status = {
    mongo: { connected: false, message: '' },
    cloudinary: { configured: false, message: '' },
    eventsCount: 0,
  };

  // 1. Test MongoDB
  try {
    const conn = await connectDB();
    if (conn) {
      status.mongo.connected = true;
      status.mongo.message = `Successfully connected to MongoDB Atlas database "${conn.connection.name}"`;

      // Check if events exist in DB, if not seed them
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const count = await (Event as any).countDocuments();
      if (count === 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (Event as any).insertMany(MOCK_EVENTS);
        status.eventsCount = MOCK_EVENTS.length;
      } else {
        status.eventsCount = count;
      }
    }
  } catch (err) {
    status.mongo.connected = false;
    status.mongo.message = (err as Error).message;
  }

  // 2. Test Cloudinary
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      const ping = await cloudinary.api.ping();
      if (ping.status === 'ok') {
        status.cloudinary.configured = true;
        status.cloudinary.message = `Successfully connected to Cloudinary Cloud "${process.env.CLOUDINARY_CLOUD_NAME}"`;
      }
    } else {
      status.cloudinary.message = 'Cloudinary environment variables missing';
    }
  } catch (err) {
    status.cloudinary.configured = false;
    status.cloudinary.message = (err as Error).message;
  }

  return status;
}
