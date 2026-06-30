import { Schema, model } from "mongoose";

interface UserTokenDoc {
  clerkUserId: string;
  expoPushToken: string;
  updatedAt: Date;
}

const userTokenSchema = new Schema<UserTokenDoc>(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    expoPushToken: { type: String, required: true },
  },
  { timestamps: true }
);

export const UserToken = model<UserTokenDoc>("UserToken", userTokenSchema);
