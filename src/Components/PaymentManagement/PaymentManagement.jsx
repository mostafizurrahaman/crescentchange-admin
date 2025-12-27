/* eslint-disable no-unused-vars */
import { Avatar, ConfigProvider, Input, message, Space, Table } from "antd";
import { useState } from "react";

import { Modal } from "antd";
import { FaCalendar, FaStopwatch } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";

import { SearchOutlined } from "@ant-design/icons";
import { AllImages } from "../../assets/image/AllImages";
import { exportToXlsx } from "../../lib/export-xlsx";
const PaymentManagement = () => {
    const userData = [
        {
            id: "#1239",
            name: "Mr. Mahmud",
            email: "mr101@mail.ru",
            total_appointment: 20,
            contact: "(+33) 7 00 55 59 27",
            address: "Corona, Michigan",
            subscription: "Basic",
            dob: "17 Dec, 2024",
            gender: "Male",
            action: "↗",
            is_active: "true",
            specialization: 'Cardiologist',
            appointment_fee: '200',
            experience: '5 years',
            date: '05/10/2025',
            paid_amount: "200",
            transection_id: "123456789",
            status: "pending"

        },
        {
            id: "#1238",
            name: "Lily",
            email: "xterris@gmail.com",
            total_appointment: 20,
            contact: "(+33) 7 00 55 59 27",
            address: "Great Falls, Maryland",
            subscription: "Premium",
            dob: "15 Jan, 2022",
            gender: "Female",
            action: "↗",
            is_active: "true",
            specialization: 'Cardiologist',
            appointment_fee: '200',
            experience: '5 years',
            date: '05/10/2025',
            paid_amount: "200",
            transection_id: "123456789",
            status: "Cancelled"

        },
        {
            id: "#1237",
            name: "Kathry",
            email: "irnabela@gmail.com",
            total_appointment: 20,
            contact: "(+33) 7 00 55 59 27",
            address: "Syracuse, Connecticut",
            subscription: "Premium",
            dob: "11 Jul, 2021",
            gender: "Female",
            action: "↗",
            is_active: "true",
            specialization: 'Cardiologist',
            appointment_fee: '200',
            experience: '5 years',
            date: '05/10/2025',
            paid_amount: "200",
            transection_id: "123456789",
            status: "completed"

        },
    ];
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState({});

    const handleSearch = () => {
        // refetc();
    };

    const handleExport = () => {
        const rows = (Array.isArray(userData) ? userData : []).map((r) => ({
            Name: r?.name || "-",
            Email: r?.email || "-",
            "Appointment Fee": r?.appointment_fee || "-",
            "Appointment Date": r?.date || "-",
            "Paid Amount": r?.paid_amount || "-",
            "Transaction ID": r?.transection_id || "-",
            Status: r?.status || "-",
        }));

        exportToXlsx({
            rows,
            sheetName: "Payments",
            fileName: `payments-${new Date().toISOString().slice(0, 10)}.xlsx`,
        });
    };
    // stsus change according to upcoming, completed, cancelled
    const handleStatusChange = (id) => {
        setStatus((prevStatus) => ({
            ...prevStatus,
            [id]: !prevStatus[id],
        }));
    }

    const columns = [
        {
            title: 'Sl No',
            dataIndex: 'slno',
            key: 'slno',
            render: (text, record, index) => index + 1
        },
        {
            title: "Doctor's Name",
            key: 'name',
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    <Avatar size={40} className="shadow-md" src={record?.profileImage || AllImages.user} />
                    <span>{record.name}</span>
                </div>
            ),
        },
        {
            title: 'Appointment Fee',
            dataIndex: 'appointment_fee',
            key: 'appointment_fee',
        },
        {
            title: 'Appointment Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Paid Amount',
            dataIndex: 'paid_amount',
            key: 'paid_amount',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Transection ID',
            dataIndex: 'transection_id',
            key: 'transection_id',
        },



        {
            title: 'Action',
            key: 'action',
            render: (_, record) => {
                const { completed, pending, canceled } = status[record.id] || {};
                return (
                    <ConfigProvider theme={{
                        components: {
                            "Button": {
                                "defaultHoverBorderColor": "rgb(47,84,235)",
                                "defaultHoverColor": "rgb(47,84,235)",
                                "defaultBorderColor": "rgb(47,84,235)"
                            }
                        }
                    }}>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleStatusChange(record.id)}
                                className={`rounded font-semibold w-24 px-2 py-1 text-white ${record.status === "pending" ? "bg-yellow-500" : record.status === "completed" ? "bg-green-500" : "bg-red-500"}`}>
                                {record.status === "pending" ? "Pending" : record.status === "completed" ? "Completed" : "Cancelled"}
                            </button>
                        </div>

                    </ConfigProvider>
                )


            }

            ,
        }
    ];


    return (
        <div className="">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-10">
                <h3 className="text-xl md:text-2xl font-semibold text-textColor px-2 md:px-0">
                    Payment Management
                </h3>
                <div className="mt-4 md:mt-0 flex justify-between items-center gap-2">
                    <div>
                        <ConfigProvider
                            theme={{
                                components: {
                                    Input: {
                                        borderRadius: 0,
                                        hoverBorderColor: "none",
                                        activeBorderColor: "none",
                                    },
                                },
                            }}
                        >
                            <div className="flex gap-2 items-center relative">

                                <Input
                                    placeholder="Search by email"
                                    allowClear
                                    size="large"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onPressEnter={handleSearch}
                                    prefix={
                                        <SearchOutlined
                                            style={{ cursor: "pointer" }}
                                            onClick={handleSearch}
                                        />
                                    }
                                />


                                <button
                                    onClick={handleSearch}
                                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-primaryColor text-white p-2 rounded-r-lg"
                                >
                                    search
                                </button>
                            </div>
                        </ConfigProvider>
                    </div>

                    <button
                        type="button"
                        onClick={handleExport}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-md"
                    >
                        Export <FiDownload className="text-base" />
                    </button>

                </div>
            </div>
            <div className="bg-white overflow-x-auto">
                <Table columns={columns} dataSource={userData || []} pagination={false} rowKey="id" />
            </div>


        </div>
    );
};

export default PaymentManagement;
