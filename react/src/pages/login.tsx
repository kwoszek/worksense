import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Button, ButtonGroup } from "@heroui/button";
import DefaultLayout from "@/layouts/default";
import { useState } from "react";
import { useLoginMutation, useRegisterMutation } from "@/services/usersApi";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from 'react-redux';
import { selectAuthUser } from '@/features/auth/authSlice';

export default function LoginPage() {
    const [mode, setMode] = useState<'login'|'register'>('login');
    const [loginMutation, { isLoading: loggingIn, error: loginError }] = useLoginMutation();
    const [registerMutation, { isLoading: registering, error: registerError }] = useRegisterMutation();
    const navigate = useNavigate();
    const location = useLocation();
    const authedUser = useSelector(selectAuthUser);
    const [passError, setPassError] = useState(false);

    // If already authenticated, redirect to dashboard
    if (authedUser) {
        navigate('/dashboard', { replace: true });
        return <DefaultLayout><div className="min-h-full flex items-center justify-center"><p>You are already logged in.</p></div></DefaultLayout>;
    }

    const from = (location.state as any)?.from?.pathname || '/dashboard';

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const identifier = (data.get('identifier') || '').toString().trim();
        const password = (data.get('password') || '').toString();
        if (!identifier || !password) return;
        try {
            await loginMutation({ identifier, password }).unwrap();
            navigate(from, { replace: true });
        } catch {}
    }

    async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const username = (data.get('username') || '').toString().trim();
        const email = (data.get('email') || '').toString().trim();
        const password: string = (data.get('password') || '').toString();
        if (!username || !email || !password.match(/[A-Z]/g) || password.length<5 || !password.match(/[0-9]/g)) {
            setPassError(true);
            return};
        try {
            await registerMutation({ username, email, password }).unwrap();
            navigate('/dashboard', { replace: true });
        } catch {}
    }

    return (
        <DefaultLayout>
            <div className="min-h-full flex items-center justify-center gap-5 p-6">
                <Card className="w-100">
                    <CardHeader className="flex justify-between w-full">
                        <ButtonGroup className="w-full">
                            <Button disabled={mode==='login'} onPress={() => setMode('login')} color={mode=="login"?"success":"default"} className="w-1/2 opacity-80">Login</Button>
                            <Button disabled={mode==='register'} onPress={() => setMode('register')} className="w-1/2 opacity-80" color={mode=="register"?"success":"default"} >Register</Button>
                        </ButtonGroup>
                    </CardHeader>
                    <Divider />
                    {mode === 'login' ? (
                        <CardBody className="p-6">
                            <Form className="flex flex-col gap-4" onSubmit={handleLogin}>
                                <Input
                                    isRequired
                                    label="Email or Username"
                                    labelPlacement="outside"
                                    name="identifier"
                                    placeholder="Enter email or username"
                                    type="text"
                                />
                                <Input
                                    isRequired
                                    label="Password"
                                    labelPlacement="outside"
                                    name="password"
                                    placeholder="Enter password"
                                    type="password"
                                />
                                {loginError && <p className="text-sm text-red-600">Login failed</p>}
                                <div className="flex gap-2 justify-center w-full">
                                    <Button  color="success" type="submit" className="w-1/2" isDisabled={loggingIn} isLoading={loggingIn}>Login</Button>
                                    <Button type="reset" variant="flat" className="w-1/2" isDisabled={loggingIn}>Reset</Button>
                                </div>
                            </Form>
                        </CardBody>
                    ) : (
                        <CardBody className="p-6">
                            <Form className="flex flex-col gap-4" onSubmit={handleRegister}>
                                <Input
                                    isRequired
                                    label="Username"
                                    labelPlacement="outside"
                                    name="username"
                                    placeholder="Choose a username"
                                    type="text"
                                />
                                <Input
                                    isRequired
                                    label="Email"
                                    labelPlacement="outside"
                                    name="email"
                                    placeholder="Enter email"
                                    type="email"
                                />
                                <Input
                                    isRequired
                                    label="Password"
                                    labelPlacement="outside"
                                    name="password"
                                    placeholder="Create password"
                                    type="password"
                                    isInvalid={passError}
                                    errorMessage="Password must be at least 5 characters long, contain at least one uppercase letter and one number."
                                />
                                {registerError && <p className="text-sm text-red-600">Registration failed</p>}
                                <div className="flex gap-2 w-full justify-center">
                                    <Button className="w-1/2" color="success" type="submit" isDisabled={registering} isLoading={registering}>Create Account</Button>
                                    <Button type="reset" className="w-1/2" variant="flat" isDisabled={registering} onPress={()=>setPassError(false)}>Reset</Button>
                                </div>
                            </Form>
                        </CardBody>
                    )}
                </Card>
            </div>
        </DefaultLayout>
    );
}
