import type {SortDescriptor} from "@heroui/react";
import {cn, ComboBox, Input, Label, ListBox, Pagination, Table} from "@heroui/react";
import {Icon} from "@iconify/react";
import {type Key, useEffect, useState} from "react";
import {getCampusList} from "../../api/auth.tsx";
import type {ArticleRequest, ArticleResponse} from "../../api/Response.tsx";


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

interface PageSizeConstant {
    id: string;
    name: string;
    value: number;
}

const pageSizeConstont : PageSizeConstant[] = [
    {
        id: "ten",
        name: "10页条",
        value : 10
    },
    {
        id: "twenty",
        name: "20页条",
        value :20
    },
    {
        id: "thirty",
        name: "30页条",
        value : 30
    },
    {
        id: "forty",
        name: "40页条",
        value : 40
    },
    {
        id: "fifty",
        name: "50页条",
        value : 50
    },
];

export default function CampusList() {
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "name",
        direction: "ascending",
    });

    const [campusList,setCampusList] = useState<ArticleResponse[]>([])

    const [pageNum, setPageNum] = useState(1);
    const [pageSize,setPageSize]  = useState(pageSizeConstont[0].value);
    const totalPages = 1;


    const [selectedKey, setSelectedKey] = useState<Key | null>("ten");
    const selectedNum = pageSizeConstont.find((a) => a.id === selectedKey);

    function changeOpinion(key){
        setSelectedKey(key)
        setPageSize(selectedNum.value)
    }


    const getPageNumbers = () => {
        // 如果总页数为 0 或 1，只返回 [1]
        if (totalPages <= 1) {
            return [1];
        }

        const pages: (number | "ellipsis")[] = [];
        pages.push(1);
        if (pageNum > 3) {
            pages.push("ellipsis");
        }
        const start = Math.max(2, pageNum - 1);
        const end = Math.min(totalPages - 1, pageNum + 1);
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        if (pageNum < totalPages - 2) {
            pages.push("ellipsis");
        }
        pages.push(totalPages);
        return pages;
    };

    function previous(){
        setPageNum(pageNum - 1)
    }


    function next(){
        setPageNum(pageNum + 1)
    }

    useEffect(()=>{
        async function fetchCampusList() {
            try {
                const articleRequest : ArticleRequest =  {
                    pageNum:pageNum,
                    pageSize:pageSize
                }
                const articleList: ArticleResponse[] = await getCampusList(articleRequest);
                setCampusList(articleList);
            } catch (error) {
                console.error('获取列表失败:', error);
            }
        }
        fetchCampusList();
    },[pageNum,pageSize])

    return (

        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
            {/* 背景动画圆圈 */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* 主内容区域 */}
            <div className="relative z-10 flex flex-col items-center justify-start min-h-screen py-8 px-[10vw]">
                <div className="w-full max-w-7xl">
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
                                                <span className="text-gray-200"></span>
                                            </SortableColumnHeader>
                                        )}
                                    </Table.Column>
                                </Table.Header>
                                <Table.Body>
                                    {campusList.length > 0 ? (
                                        campusList.map((campus) => (
                                            <Table.Row key={campus.id} id={campus.id} className="bg-gray-800/30 hover:bg-gray-700/40 transition-colors">
                                                <Table.Cell className="text-center text-gray-300 bg-transparent">{campus.title}</Table.Cell>
                                            </Table.Row>
                                        ))
                                    ) : (
                                        <Table.Row>
                                            <Table.Cell className="text-center text-gray-400 py-8">
                                                暂无数据
                                            </Table.Cell>
                                        </Table.Row>
                                    )}
                                </Table.Body>
                            </Table.Content>
                        </Table.ScrollContainer>
                    </Table>
                </div>

                {/* 分页组件 */}
                <div className="w-full max-w-2xs overflow-x-auto sm:max-w-full backdrop-blur-lg">
                    <Pagination className="justify-center">
                        <Pagination.Content>
                            <Pagination.Item>
                                <Pagination.Previous isDisabled={pageNum === 1} onPress={() => previous()}>
                                    <Pagination.PreviousIcon />
                                    <span>上一页</span>
                                </Pagination.Previous>
                            </Pagination.Item>
                            {getPageNumbers().map((p, i) =>
                                p === "ellipsis" ? (
                                    <Pagination.Item key={`ellipsis-${i}`}>
                                        <Pagination.Ellipsis />
                                    </Pagination.Item>
                                ) : (
                                    <Pagination.Item key={p}>
                                        <Pagination.Link isActive={p === pageNum} onPress={() => setPageNum(p)}>
                                            {p}
                                        </Pagination.Link>
                                    </Pagination.Item>
                                ),
                            )}
                            <Pagination.Item>
                                <Pagination.Next isDisabled={pageNum === totalPages} onPress={() => next()}>
                                    <span>下一页</span>
                                    <Pagination.NextIcon />
                                </Pagination.Next>
                            </Pagination.Item>
                        </Pagination.Content>

                        <span className="">
                        <ComboBox
                            className="w-[256px]"
                            selectedKey={selectedKey}
                            onSelectionChange={(key) =>{
                                changeOpinion(key)
                            }}
                        >
                            <Label></Label>
                            <ComboBox.InputGroup>
                                <Input placeholder="Search animals..." />
                                <ComboBox.Trigger />
                            </ComboBox.InputGroup>
                            <ComboBox.Popover>
                                <ListBox>
                                    {pageSizeConstont.map((number) => (
                                        <ListBox.Item key={number.id} id={number.id} textValue={number.name}>
                                            {number.name}
                                            <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                    ))}
                                </ListBox>
                            </ComboBox.Popover>
                        </ComboBox>

                        </span>
                    </Pagination>
                </div>
            </div>
        </div>
    );
}