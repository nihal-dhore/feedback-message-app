import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";


export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json({
      success: false,
      message: "Unauthorized Request"
    }, {
      status: 401
    });
  }

  try {
    await dbConnect();

    const userId = new mongoose.Types.ObjectId(session.user._id);


  } catch (error) {
    return Response.json({
      success: false,
      message: "Internal server error"
    }, {
      status: 500
    });
  }
}