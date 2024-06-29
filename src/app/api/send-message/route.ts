import dbConnect from "@/lib/dbConnect";
import UserModel, { Message } from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();

  const { username, content } = await request.json();

  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      return Response.json({
        success: false,
        message: "User not found"
      }, {
        status: 401
      });
    }

    if (!user.isAcceptingMessage) {
      return Response.json({
        success: false,
        message: "User is not accepting messages"
      }, {
        status: 403
      });
    }

    const message = { content, createdAt: new Date() };

    user.messages.push(message as Message);

    await user.save();

    return Response.json({
      success: true,
      message: "Message sent successfully"
    });
  } catch (error) {
    console.log(error);

    return Response.json({
      success: false,
      message: "Internal Server Error"
    }, {
      status: 500
    });
  }
}