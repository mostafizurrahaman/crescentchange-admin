 import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { Button, Spin, message } from "antd";
import { Link, useLocation } from "react-router-dom";

import { useGetContentQuery, useUpdateContentMutation } from '../../../redux/feature/content/contentApis';

const TermsCondition = () => {
    const [value, setValue] = useState('');

    const location = useLocation();

    const { data, isFetching, isError } = useGetContentQuery();
    const [updateContent, { isLoading }] = useUpdateContentMutation();

    useEffect(() => {
        const next = data?.data?.terms;
        if (typeof next === "string") {
            setValue(next);
        }
    }, [data?.data?.terms]);

    const handleSubmit = async () => {
        try {
            await updateContent({ terms: value }).unwrap();
            message.success("Terms condition updated successfully");
        } catch (err) {
            message.error(err?.data?.message || "Failed to update terms condition");
        }
    };
    return (
        <div className="mx-2 mb-10">
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h1 className="mb-2 text-2xl font-semibold md:text-3xl">Terms Condition</h1>
                    <p className="text-gray-500">
                        Update the terms condition shown to users.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        to="/settings/contact-us"
                        className={`px-4 py-2 text-sm font-medium bg-white border rounded-full ${
                            location.pathname === "/settings/contact-us" ? "bg-lime-300 border-lime-300" : ""
                        }`}
                    >
                        General
                    </Link>
                    <Link
                        to="/settings/terms-condition"
                        className={`px-4 py-2 text-sm font-medium bg-white border rounded-full ${
                            location.pathname === "/settings/terms-condition" ? "bg-lime-300 border-lime-300" : ""
                        }`}
                    >
                        Terms Condition
                    </Link>
                    <Link
                        to="/settings/privacy-policy"
                        className={`px-4 py-2 text-sm font-medium bg-white border rounded-full ${
                            location.pathname === "/settings/privacy-policy" ? "bg-lime-300 border-lime-300" : ""
                        }`}
                    >
                        Privacy Policy
                    </Link>
                </div>
            </div>

            <div className="p-4 bg-white shadow rounded-xl">
                {isError ? (
                    <div className="flex items-center justify-center min-h-[420px]">
                        <p className="text-sm text-gray-600">Failed to load terms condition.</p>
                    </div>
                ) : isFetching ? (
                    <div className="flex items-center justify-center min-h-[420px]">
                        <Spin />
                    </div>
                ) : (
                    <div className="min-h-[420px]">
                        <ReactQuill
                            style={{ height: 490 }}
                            theme="snow"
                            value={value}
                            onChange={setValue} />
                    </div>
                )}

                <div className="flex justify-end mt-20">
                    <Button type="primary" onClick={handleSubmit} loading={isLoading} disabled={isFetching || isError}>
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TermsCondition;