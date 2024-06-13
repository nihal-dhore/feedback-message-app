import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { verifySchema } from "@/schemas/verifySchema";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

interface Body {
  verificationCode: string;
}
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({
      success: false,
      message: "Unauthorized Request"
    }, {
      status: 404
    });
  }

  if (session?.user.isVerified) {
    return Response.json({
      success: false,
      message: "User is already verified"
    }, {
      status: 400
    });
  }
  const body: Body = await req.json();

  const verificationCodeValidationResult = verifySchema.safeParse({ code: body.verificationCode });

  if (!verificationCodeValidationResult.success) {
    return Response.json({
      success: false,
      message: verificationCodeValidationResult.error.format()._errors
    });
  }

  try {
    await dbConnect();

    const user = await UserModel.findOne({
      _id: session.user._id
    });
    if (!user) {
      return Response.json({
        success: false,
        message: "User not found"
      }, {
        status: 404
      });
    }

    if (user.verificationCode !== body.verificationCode) {
      return Response.json({
        success: false,
        message: "Incorrect Verification code"
      }, {
        status: 400
      });
    }

    const isCodeExpired = new Date(user.verificationCodeExpiry) < new Date();
    if (isCodeExpired) {
      return Response.json({
        success: false,
        message: "Verification code is Expired Generate a new code"
      }, {
        status: 400
      });
    }

    user.isVerified = true;

    await user.save();

    return Response.json({
      success: true,
      message: "Account verified successfully"
    });

  } catch (error) {
    console.error(error);
    return Response.json({
      success: false,
      message: "Something went wrong"
    }, {
      status: 500
    });
  }
}