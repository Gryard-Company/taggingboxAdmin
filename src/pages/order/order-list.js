import { Fragment, useEffect, useMemo, useState } from "react"
import axios from "utils/axios"

import { format } from 'date-fns';

const { Grid, Paper, TableRow, TableCell, TableBody, TableHead, useTheme, useMediaQuery, Stack, Table, Button } = require("@mui/material")
import { useFilters, useExpanded, useGlobalFilter, useRowSelect, useSortBy, useTable, usePagination } from 'react-table';
import { alpha } from '@mui/material/styles';

import ScrollX from "components/ScrollX";
import {
    CSVExport,
    HeaderSort,
    // IndeterminateCheckbox,
    // SortingSelect,
    TablePagination,
    TableRowSelection
  } from 'components/third-party/ReactTable';

import cardCode from "data/card-code";

import { GlobalFilter } from 'utils/react-table';

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, setSelectedRow, selectedRow }) {

    const theme = useTheme();
    const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

    // const filterTypes = useMemo(() => renderFilterTypes, []);
    const sortBy = { id: 'memId', desc: false };
    
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        setHiddenColumns,
        // allColumns,
        //   visibleColumns, // eslint-disable-next-line
        rows,
        page,
        gotoPage,
        setPageSize,
        state: { globalFilter, selectedRowIds, pageIndex, pageSize },
        // setSortBy,
        preGlobalFilteredRows,
        setGlobalFilter,
        selectedFlatRows
    } = useTable(
      {
        columns,
        data,
        // filterTypes,
        initialState: { pageIndex: 0, pageSize: 10, sortBy: [sortBy] }
      },
      useGlobalFilter,
      useFilters,
      useSortBy,
      useExpanded,
      usePagination,
      useRowSelect
    );

    useEffect(() => {
      if (matchDownSM) {
        setHiddenColumns(['age', 'contact', 'visits', 'email', 'status', 'avatar']);
      } else {
        setHiddenColumns(['avatar', 'email']);
      }
      // eslint-disable-next-line
    }, [matchDownSM]);

    // 유저 선택 이벤트
    const handleRowClick = (row) => {
        setSelectedRow(row);
    };
  
    return (
      <>
        <TableRowSelection selected={Object.keys(selectedRowIds).length} />
        <Stack spacing={3}>
          <Stack
            direction={matchDownSM ? 'column' : 'row'}
            spacing={1}
            justifyContent="space-between"
            alignItems="center"
            sx={{ p: 3, pb: 0, paddingLeft: '0 !important', paddingRight: '0 !important' }}
          >
            <GlobalFilter preGlobalFilteredRows={preGlobalFilteredRows} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
            <Stack direction={matchDownSM ? 'column' : 'row'} alignItems="center" spacing={2}>
              {/* <SortingSelect sortBy={sortBy.id} setSortBy={setSortBy} allColumns={allColumns} /> */}
              <Button onClick={() => setSelectedRow(null)} color="success" size="large" variant="contained" className="btn-xl">
                <CSVExport data={selectedFlatRows.length > 0 ? selectedFlatRows.map((d) => d.original) : data} filename={'customer-list.csv'} />목록 다운로드
              </Button>
            </Stack>
          </Stack>
          <Table {...getTableProps()}>
            <TableHead>
              {headerGroups.map((headerGroup) => (
                <TableRow key={headerGroup} {...headerGroup.getHeaderGroupProps()} sx={{ '& > th:first-of-type': { width: '58px' } }}>
                  {headerGroup.headers.map((column) => (
                    <TableCell key={column} {...column.getHeaderProps([{ className: column.className }])}>
                      <HeaderSort column={column} sort />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody {...getTableBodyProps()}>
              {page.map((row, i) => {
                prepareRow(row);
  
                return (
                  <Fragment key={i}>
                    <TableRow
                      {...row.getRowProps()}
                      onClick={() => {
                        handleRowClick(row);
                      }}
                      sx={{ cursor: 'pointer', bgcolor: selectedRow?.id == row.id ? alpha(theme.palette.primary.lighter, 0.35) : 'inherit' }}
                    >
                      {row.cells.map((cell) => {
 
                        return(
                            <TableCell key={cell} {...cell.getCellProps([{ className: cell.column.className }])}>
                            {cell.render('Cell')}
                            </TableCell>
                        )
                        
                      })}
                    </TableRow>
                  </Fragment>
                );
              })}
              <TableRow sx={{ '&:hover': { bgcolor: 'transparent !important' } }}>
                <TableCell sx={{ p: 2, py: 3, paddingLeft: '0 !imporatnt', paddingRight: '0 !important' }} colSpan={12}>
                  <TablePagination gotoPage={gotoPage} rows={rows} setPageSize={setPageSize} pageSize={pageSize} pageIndex={pageIndex} />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Stack>
      </>
    );
}

// ==============================|| Orderlist - LIST ||============================== //

const OrderList = () => {

    const [orderList, setOrderList] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    

    const getOrderList = () => {
        
        let param = {} // 검색,필터
        
        axios.post('api/admin/order-list',param).then((res)=>{
            console.log(res.data.list)
            setOrderList(res.data.list);
        });
    }

    const paymentCancel = (value) => {
        console.log(value);
        let param = {
            payment_key : value?.payment_key,
            order_id : value?.order_id
        }

        axios.post('api/admin/payment-cancel',param).then((res)=>{
            console.log(res);
            if(res.data.success){
                alert('해당 결제내역이 정상적으로 취소처리 되었습니다.')
            } else {
                alert('오류가 발생했습니다. log - ['+res.data.msg+']');
            }
            getOrderList();
        });
    }

    useEffect(()=>{
        getOrderList();
    },[])

    const columns = useMemo(
        () => [
          {
            Header: '아이디',
            accessor: 'mem_userid',
          },
          {
            Header: '닉네임',
            accessor: 'mem_usernm'
          },
          {
            Header: '주문ID',
            accessor: 'order_id'
          },
          {
            Header: '결제내용',
            accessor: 'order_content'
          },
          {
            Header: '결제금액',
            accessor: 'amount',
            Cell: ({row}) => {
                const {values} = row;
                return (
                    <>{values.amount.toLocaleString()}원</>
                )
            }
          },
          {
            Header: '결제일자',
            accessor: 'transaction_dt',
            Cell: ({row}) => {
                const {values} = row;
                return (
                    <>{format(new Date(values.transaction_dt),'yyyy-MM-dd HH:mm:ss')}</>
                )
            }
          },
          {
            Header: '결제상태',
            accessor: 'status',
            Cell: ({row}) => {
                const {values} = row;
                let status = '';
                switch (values.status) {
                    case 'order':
                        status = '주문'
                        break;

                    case 'cancel':
                        status = '취소'
                        break;
                }
                return (
                    <>
                        {status}
                    </>
                )
            }
          },
          {
            Header: '상태변경일자',
            accessor: 'update_dt',
            Cell: ({row}) => {
                const {values} = row;
                return (
                    <>{ values?.update_dt ? format(new Date(values.update_dt),'yyyy-MM-dd HH:mm:ss') : ''}</>
                )
            }
          },
          {
            Header: '결제정보',
            accessor: 'card_info',
            Cell: ({row}) => {
                const {values} = row;
                if(values?.card_info){
                    let cardInfo = JSON.parse(values?.card_info);
                    let number = cardInfo.number;
                    let acquirerCode = cardCode[cardInfo.acquirerCode];

                    return (
                        <>{number+'('+acquirerCode+')'}</>
                    )
                } else {
                    return '';
                }

            }
          },
          {
            Header: '결제취소',
            accessor: 'cancel',
            Cell: ({row}) => {
                const {original} = row;
                
                return (
                  // 취소되었을때 취소해야할때 구분되었으면 좋겠어요.
                    <Button onClick={()=>{paymentCancel(original)}} size="medium" variant="outlined" color="error">취소하기</Button>
                    // <Button onClick={()=>{paymentCancel(original)}} size="medium" variant="outlined" color="secondary">취소하기</Button>
                )

            }
          },

        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
    );

    return (
        <Grid className="order-tbl">
            <Paper elevation={3} style={{ padding: 20 }}>
            <ScrollX>
                {
                    orderList.length > 0 &&
                    <ReactTable columns={columns} data={orderList} setSelectedRow={setSelectedRow} selectedRow={selectedRow} />
                }
            </ScrollX>
            </Paper>
        </Grid>
    )
}

export default OrderList;