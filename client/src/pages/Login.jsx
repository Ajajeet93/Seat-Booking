import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(employeeId, password);
            toast.success('Logged in successfully!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-2xl p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] border border-white/20 relative z-20">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-white/5 border border-white/10 shadow-inner backdrop-blur-md">
                        <Building2 className="h-10 w-10 text-gray-300" />
                    </div>
                    <h2 className="mt-8 text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                        Wissen Seats
                    </h2>
                    <p className="mt-3 text-sm text-gray-300 font-medium">
                        Intelligent workspace allocation
                    </p>
                </div>
                <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2 drop-shadow-sm">Employee ID</label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                placeholder="e.g. EMP001"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2 drop-shadow-sm">Password</label>
                            <input
                                type="password"
                                required
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full btn-primary text-lg"
                        >
                            Sign In to Workspace
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
