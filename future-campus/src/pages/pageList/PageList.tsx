import type {SortDescriptor} from "@heroui/react";

import {Table, cn} from "@heroui/react";
import {Icon} from "@iconify/react";
import {useMemo, useState} from "react";

interface User {
    id: number;
    name: string;
    role: string;
    status: string;
    email: string;
}

const users: User[] = [
    {email: "kate@acme.com", id: 1, name: "Kate Moore", role: "CEO", status: "Active"},
    {email: "john@acme.com", id: 2, name: "John Smith", role: "CTO", status: "Active"},
    {email: "sara@acme.com", id: 3, name: "Sara Johnson", role: "CMO", status: "On Leave"},
    {email: "michael@acme.com", id: 4, name: "Michael Brown", role: "CFO", status: "Active"},
    {
        email: "emily@acme.com",
        id: 5,
        name: "Emily Davis",
        role: "Product Manager",
        status: "Inactive",
    },
];

function SortableColumnHeader({
                                  children,
                                  sortDirection,
                              }: {
    children: React.ReactNode;
    sortDirection?: "ascending" | "descending";
}) {
    return (
        <span className="flex items-center justify-between">
      {children}
            {!!sortDirection && (
                <Icon
                    icon="gravity-ui:chevron-up"
                    className={cn(
                        "size-3 transform transition-transform duration-100 ease-out",
                        sortDirection === "descending" ? "rotate-180" : "",
                    )}
                />
            )}
    </span>
    );
}

export default function CampusList() {
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "name",
        direction: "ascending",
    });

    const sortedUsers = useMemo(() => {
        return [...users].sort((a, b) => {
            const col = sortDescriptor.column as keyof User;
            const first = String(a[col]);
            const second = String(b[col]);
            let cmp = first.localeCompare(second);

            if (sortDescriptor.direction === "descending") {
                cmp *= -1;
            }

            return cmp;
        });
    }, [sortDescriptor]);

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-slate-900">
            {/* 背景动画圆圈 */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>
            
            {/* 主内容区域 */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-[10vw] py-8">
                <Table className="w-full bg-gray-900/40 backdrop-blur-sm rounded-lg shadow-lg border border-white/10">
                    <Table.ScrollContainer>
                        <Table.Content
                            aria-label="Sortable table"
                            className="min-w-[600px] text-gray-800"
                            sortDescriptor={sortDescriptor}
                            onSortChange={setSortDescriptor}
                        >
                            <Table.Header className="bg-gray-800/50">
                                <Table.Column allowsSorting isRowHeader id="name">
                                    {({sortDirection}) => (
                                        <SortableColumnHeader sortDirection={sortDirection}>
                                            <span className="text-gray-200">Name</span>
                                        </SortableColumnHeader>
                                    )}
                                </Table.Column>
                                <Table.Column allowsSorting id="role">
                                    {({sortDirection}) => (
                                        <SortableColumnHeader sortDirection={sortDirection}>
                                            <span className="text-gray-200">Role</span>
                                        </SortableColumnHeader>
                                    )}
                                </Table.Column>
                                <Table.Column allowsSorting id="status">
                                    {({sortDirection}) => (
                                        <SortableColumnHeader sortDirection={sortDirection}>
                                            <span className="text-gray-200">Status</span>
                                        </SortableColumnHeader>
                                    )}
                                </Table.Column>
                                <Table.Column allowsSorting id="email">
                                    {({sortDirection}) => (
                                        <SortableColumnHeader sortDirection={sortDirection}>
                                            <span className="text-gray-200">Email</span>
                                        </SortableColumnHeader>
                                    )}
                                </Table.Column>
                            </Table.Header>
                            <Table.Body>
                                {sortedUsers.map((user) => (
                                    <Table.Row key={user.id} id={user.id} className="bg-gray-800/30 hover:bg-gray-700/40 transition-colors">
                                        <Table.Cell className="text-center text-gray-300 bg-transparent">{user.name}</Table.Cell>
                                        <Table.Cell className="text-center text-gray-300 bg-transparent">{user.role}</Table.Cell>
                                        <Table.Cell className="text-center text-gray-300 bg-transparent">{user.status}</Table.Cell>
                                        <Table.Cell className="text-center text-gray-300 bg-transparent">{user.email}</Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Content>
                    </Table.ScrollContainer>
                </Table>
            </div>
        </div>
    );
}