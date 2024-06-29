import { Session, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";


export async function GET(req: Request) {
  const session: Session | null = await getServerSession(authOptions);

  if (!session || !session?.user) {
    return Response.json({
      success: false,
      message: "Unauthorized Request"
    }, {
      status: 401
    });
  }

  try {
    await dbConnect();

    const userId = new mongoose.Types.ObjectId(session?.user._id);

    try {
      const user = await UserModel.aggregate([
        {
          $match: {
            id: userId
          }
        },
        {
          $unwind: '$messages'
        },
        {
          $sort: { "messages.createdAt": -1 }
        },
        {
          $group: {
            _id: "$_id",
            messages: {
              $push: "$messages"
            }
          }
        }
      ]);

      if (!user || user.length === 0) {
        return Response.json({
          success: false,
          message: "User not found"
        },
          {
            status: 401
          }
        );
      }

      return Response.json({
        success: true,
        messages: user[0].messages
      });
    } catch (error) {
      return Response.json({
        success: false,
        message: "Internal Server Error"
      });
    }

  } catch (error) {
    return Response.json({
      success: false,
      message: "Internal server error"
    }, {
      status: 500
    });
  }
}