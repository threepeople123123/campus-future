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
        <div className="w-full pt-[20vh] px-[10vw] min-h-screen bg-cover bg-center bg-no-repeat"
             style={{
                 backgroundImage: `url('/wallhaven-qrjmgl_3840x2160.png')`,
             }}>
            <Table className="w-full bg-white/20 backdrop-blur-sm rounded-lg shadow-lg">
                <Table.ScrollContainer>
                    <Table.Content
                        aria-label="Sortable table"
                        className="min-w-[600px] text-gray-800"
                        sortDescriptor={sortDescriptor}
                        onSortChange={setSortDescriptor}
                    >
                        <Table.Header className="bg-white/30">
                            <Table.Column allowsSorting isRowHeader id="name">
                                {({sortDirection}) => (
                                    <SortableColumnHeader sortDirection={sortDirection}>Name</SortableColumnHeader>
                                )}
                            </Table.Column>
                            <Table.Column allowsSorting id="role">
                                {({sortDirection}) => (
                                    <SortableColumnHeader sortDirection={sortDirection}>Role</SortableColumnHeader>
                                )}
                            </Table.Column>
                            <Table.Column allowsSorting id="status">
                                {({sortDirection}) => (
                                    <SortableColumnHeader sortDirection={sortDirection}>Status</SortableColumnHeader>
                                )}
                            </Table.Column>
                            <Table.Column allowsSorting id="email">
                                {({sortDirection}) => (
                                    <SortableColumnHeader sortDirection={sortDirection}>Email</SortableColumnHeader>
                                )}
                            </Table.Column>
                        </Table.Header>
                        <Table.Body>
                            {sortedUsers.map((user) => (
                                <Table.Row key={user.id} id={user.id} className="bg-white/10 hover:bg-white/30 transition-colors">
                                    <Table.Cell className="text-center text-gray-700 bg-transparent">{user.name}</Table.Cell>
                                    <Table.Cell className="text-center text-gray-700 bg-transparent">{user.role}</Table.Cell>
                                    <Table.Cell className="text-center text-gray-700 bg-transparent">{user.status}</Table.Cell>
                                    <Table.Cell className="text-center text-gray-700 bg-transparent">{user.email}</Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Content>
                </Table.ScrollContainer>
            </Table>
        </div>
    );
}