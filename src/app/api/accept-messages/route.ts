import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { acceptMessageSchema } from "@/schemas/acceptSchema";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);


  if (!session || !session.user) {
    return Response.json({
      success: false,
      message: "Unauthorized Request"
    }, {
      status: 401
    });
  }

  const userId = session.user?._id;

  const { toAcceptMessages } = await req.json();

  const acceptMessagesValidation = acceptMessageSchema.safeParse({ acceptMessages: toAcceptMessages });

  if (!acceptMessagesValidation.success) {
    return Response.json({
      success: false,
      message: acceptMessagesValidation.error.format()._errors
    }, {
      status: 400
    });
  }

  try {
    await dbConnect();

    const user = await UserModel.findOne({
      _id: userId
    });
    if (!user) {
      return Response.json({
        success: false,
        message: "User not found"
      }, {
        status: 404
      });
    }
    user.isAcceptingMessage = true;
    await user.save();

    return Response.json({
      success: true,
      message: "User is accepting messages"
    });
  } catch (error) {
    console.error(error);
    return Response.json({
      success: false,
      message: "Failed to update user status to accept messages"
    }, {
      status: 500
    });
  }
}

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

    const user = await UserModel.findById(session.user._id);

    if (!user) {
      return Response.json({
        success: false,
        message: "User not found"
      }, {
        status: 404
      });
    }

    return Response.json({
      success: true,
      isAcceptingMessages: user.isAcceptingMessage,
    }, {
      status: 200
    });

  } catch (error) {
    return Response.json({
      success: false,
      message: "Failed to get status of weather user is accepting messages"
    }, {
      status: 500
    });
  }
}