import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const username = searchParams.get("username");
  const usernameValidationResults = usernameValidation.safeParse(username);

  console.log(usernameValidationResults);

  if (!usernameValidationResults.success) {
    const usernameErrors = usernameValidationResults.error.format()._errors || [];
    return Response.json({
      success: false,
      message: usernameErrors?.length > 0 ? usernameErrors.join(",") : "Invalid format of username"
    }, {
      status: 400
    });
  }

  //console.log(usernameValidationResults);
  

  try {
    await dbConnect();
    const user = await UserModel.findOne({
      username
    });

    if (user) {
      return Response.json({
        success: false,
        message: "User with entered username already exists"
      }, {
        status: 400
      });
    }
    return Response.json({
      success: true,
      message: "Username is available"
    }, {
      status: 200
    });

  } catch (error) {
    return Response.json({
      success: false,
      message: "Error while checking username"
    }, {
      status: 500
    });
  }

}