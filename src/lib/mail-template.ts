export const emailVerificationMailTemplate = (token: string) => {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
<head>
  <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
  <meta name="x-apple-disable-message-reformatting" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white m-0 p-0 font-sans py-4">
  <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" class="max-w-lg mx-auto px-5">
    <tbody>
      <tr class="w-full">
        <td>
          <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" class="mt-8">
            <tbody>
              <tr>
                <td>
                  <img alt="esamudaay" height="36" src="https://www.esamudaay.com/_next/static/media/navbarLogo.f8c58e34.svg" class="block outline-none border-none" width="300" />
                </td>
              </tr>
            </tbody>
          </table>
          <h1 class="text-gray-900 text-3xl font-bold my-8 leading-tight">Confirm your email address</h1>
          <p class="text-lg leading-7 mb-8">Your confirmation code is below - enter it in your open browser window and we'll help you get signed in.</p>
          <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" class="bg-gray-200 rounded-md mb-8 p-10">
            <tbody>
              <tr>
                <td>
                  <p class="text-3xl leading-6 text-center align-middle py-4">${token}</p>
                </td>
              </tr>
            </tbody>
          </table>
          <p class="text-sm leading-6 mb-8 text-gray-900">If you didn't request this email, there's nothing to worry about, you can safely ignore it.</p>
          
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;
};
