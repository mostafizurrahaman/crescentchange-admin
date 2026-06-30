import { Button, Checkbox, ConfigProvider, Form, Input, Modal, message } from "antd";
import { AiOutlineMail } from "react-icons/ai";
import { MdLockOutline } from "react-icons/md";
import { useState } from "react";
import { Link } from "react-router-dom";

import img from "../../../assets/image/login.png";
import { useLoginMutation, useTwoFaVerifyLoginMutation } from "../../../redux/feature/auth/authApi";
import logo from "../../../assets/image/Logo.png";

const SignIn = () => {
  const [login, { isLoading }] = useLoginMutation();
  const [twoFaVerifyLogin, { isLoading: isTwoFaVerifying }] = useTwoFaVerifyLoginMutation();

  const [isTwoFaModalOpen, setIsTwoFaModalOpen] = useState(false);
  const [twoFaEmail, setTwoFaEmail] = useState("");
  const [twoFaToken, setTwoFaToken] = useState("");

  const onFinish = async (values) => {
    try {
      const res = await login({
        email: values["email-address"],
        password: values.password.replace(/\s+/g, "")
      }).unwrap();
      if (res?.data?.twoFactorRequired) {
        setTwoFaEmail(res?.data?.email || values["email-address"]);
        setTwoFaToken("");
        setIsTwoFaModalOpen(true);
        message.info(res?.data?.message || "Please enter your 2FA code to continue");
        return;
      }
      // On non-2FA success, the authApi will handle token storage and redirection
    } catch  {
      // Error is already handled by authApi's onQueryStarted
    }
  };

  const handleSubmitTwoFa = async () => {
    if (!twoFaToken) {
      message.error("Please enter your 2FA code");
      return;
    }

    try {
      await twoFaVerifyLogin({
        email: twoFaEmail,
        token: twoFaToken,
      }).unwrap();
      setIsTwoFaModalOpen(false);
      setTwoFaToken("");
      setTwoFaEmail("");
      // authApi will store token and redirect
    } catch {
      // Error toast handled by authApi onQueryStarted
    }
  };

  return (
    <div className="flex h-screen p-2">
      <div className="flex flex-col items-center justify-center w-full bg-white md:w-1/2">
        <img src={logo} alt="Logo" className="absolute top-5 right-5 left-10" />

        <div className="w-[400px]">
          <div>
            <ConfigProvider
              theme={{
                components: {
                  Form: { borderRadius: 0 },
                  Input: { borderRadius: 5 },
                },
              }}
            >
              <Form
                name="login"
                initialValues={{ remember: false }}
                onFinish={onFinish}
                layout="vertical"
              >
                <div className="mb-4 text-center">
                  <h2 className="mb-6 text-xl font-bold md:text-2xl lg:text-3xl">
                    Welcome Back!
                  </h2>
                  <p className="text-neutral-400 lg:text-lg">
                    Sign in to access the Super Admin Dashboard.
                  </p>
                </div>

                <Form.Item
                  name="email-address"
                  label={<p className="text-lg">Email Address</p>}
                  rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                  ]}
                >
                  <Input
                    prefix={<AiOutlineMail className="w-5 h-5 mr-2" />}
                    placeholder="mailto:admin@crescentchange.org"
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      width: "100%",
                      height: "52px",
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<p className="text-lg">Password</p>}
                  rules={[
                    { required: true, message: 'Please input your password!' }
                  ]}
                >
                  <Input.Password
                    prefix={<MdLockOutline className="w-5 h-5 mr-2" />}
                    placeholder="Enter Your Password"
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      width: "100%",
                      height: "52px",
                    }}
                  />
                </Form.Item>

                <div className="flex items-center justify-between gap-2 my-6 font-semibold text-md">
                  <ConfigProvider
                    theme={{
                      components: {
                        Checkbox: {
                          colorPrimary: "rgb(209,255,67)",
                          colorPrimaryBorder: "rgb(209,255,67)",
                          colorPrimaryHover: "rgb(209,255,67)",
                        },
                      },
                    }}
                  >
                    <Checkbox>Remember Password</Checkbox>
                  </ConfigProvider>
                  <Link to="/forgot-password" className="underline text-md hover:text-black">
                    Forgot Password?
                  </Link>
                </div>

                <Form.Item>
                  <Button
                    className="w-full p-2 py-4 text-lg font-bold text-center rounded-md bg-primary hover:text-black h-auto border-0"
                    htmlType="submit"
                    loading={isLoading}
                  >
                    Sign In
                  </Button>
                </Form.Item>
              </Form>
            </ConfigProvider>
          </div>
        </div>
      </div>

      <Modal
        title="Two-Factor Authentication"
        open={isTwoFaModalOpen}
        onCancel={() => {
          setIsTwoFaModalOpen(false);
          setTwoFaToken("");
          setTwoFaEmail("");
        }}
        footer={null}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Enter the 6-digit code from your authenticator app.
          </p>

          <Input
            placeholder="6-digit code"
            value={twoFaToken}
            onChange={(e) => setTwoFaToken(e.target.value)}
            maxLength={6}
          />

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setIsTwoFaModalOpen(false);
                setTwoFaToken("");
                setTwoFaEmail("");
              }}
              disabled={isTwoFaVerifying}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSubmitTwoFa}
              loading={isTwoFaVerifying}
            >
              Verify
            </Button>
          </div>
        </div>
      </Modal>

      <div className="w-full md:w-1/2">
        <img src={img} alt="sign-up" className="w-full h-full" />
      </div>
    </div>
  );
};

export default SignIn;