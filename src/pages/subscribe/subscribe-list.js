import { Fragment, useEffect, useMemo, useState } from "react"
import axios from "utils/axios"

import { format, isSameDay, isBefore, isPast } from 'date-fns';

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
import SubscribeInfo from "sections/subscribe/SubscribeInfo";

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
              <Button onClick={() => setSelectedRow(null)} color="warning" size="large" variant="contained" className="btn-new">새로 생성하기</Button>
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
                <TableCell sx={{ p: 2, py: 3 }} colSpan={9}>
                  <TablePagination gotoPage={gotoPage} rows={rows} setPageSize={setPageSize} pageSize={pageSize} pageIndex={pageIndex} />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Stack>
      </>
    );
}

// ==============================|| SubscriveList - LIST ||============================== //
const SubscribeList = () => {

    const [subscribeList, setSubscribeList] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);

    
    const getSubscribeList = () => {
        
        let param = {} // 검색,필터
        
        axios.post('api/admin/subscribe-list',param).then((res)=>{
            console.log(res.data.list)
            setSubscribeList(res.data.list);
            setFilteredData(res.data.list);
        });
    }

    useEffect(()=>{
        getSubscribeList();
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
            Header: '구독정보',
            accessor: 'subscribe_type',
            Cell: ({row}) => {
                const {values} = row;
                let subscribe_type = '';
                switch (values.subscribe_type) {
                    case 'PLUS_MONTHLY':
                        subscribe_type = '유료회원(월결제)'
                        break;

                    case 'PLUS_SUPER':
                        subscribe_type = '유료회원(결제X)'
                        break;

                    case 'ENTERPRISE':
                        subscribe_type = 'Enterprise'
                        break;
                }
                return (
                    <>{ values?.subscribe_type ? subscribe_type : ''}</>
                )
            }
          },
          {
            Header: '마지막 주문ID',
            accessor: 'last_order_id'
          },
          {
            Header: '다음결제일(사용가능기간)',
            accessor: 'next_payment_date',
            Cell: ({row}) => {
                const {values} = row;
                return (
                    <>{ values?.next_payment_date ? format(new Date(values.next_payment_date),'yyyy-MM-dd HH:mm:ss') : ''}</>
                )
            }
          },
          {
            Header: '갱신여부',
            accessor: 'renewal',
            Cell: ({row}) => {
                const {values} = row;
                return (
                    <>{values.renewal == 1 ? 'O' : 'X'}</>
                )
            }
          },
          {
            Header: '상태',
            accessor: 'status',
            Cell: ({row}) => {
                const {values} = row;

                const nextPaymentDate = new Date(values.next_payment_date);
                const today = new Date();

                return (
                    // 색상으로 구분하면 좋을 것 같음
                    <>
                        {isSameDay(nextPaymentDate,today) ? '갱신일' : (isBefore(today,nextPaymentDate) ? '사용중' : '만료')}
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
          }

        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
    );
    
    const filterData = (type) => {

        let filterData;
        
        switch(type){
            // 전체
            case 1:
                filterData = subscribeList;
                break;
        
            //사용
            case 2:
                filterData = subscribeList.filter((row) => isBefore(new Date(),new Date(row.next_payment_date))
                );
                break;
        
            //갱신일
            case 3:
                filterData = subscribeList.filter((row) => isSameDay(new Date(),new Date(row.next_payment_date))
                );
                break;
        
            //만료
            case 4:
                filterData = subscribeList.filter((row) =>  !isSameDay(new Date(),new Date(row.next_payment_date)) && isPast(new Date(row.next_payment_date))
                );
                break;
        }
        
        setFilteredData(filterData);
    }
                     

    return (
        <Grid container spacing={2}>
            <Grid item xs={9}>
                <Paper elevation={3} style={{ padding: 20, minHeight: '590px' }}>
                <Grid className="btn-tabs">
                  <Button variant="outlined" color="secondary" size="medium" sx={{mr: 2}} onClick={() => filterData(1)}>전체</Button>
                  <Button variant="outlined" color="info" size="medium" sx={{mr: 2}} onClick={() => filterData(3)}>오늘 결제(완료)</Button>
                  <Button variant="outlined" color="success" size="medium" sx={{mr: 2}} onClick={() => filterData(2)}>사용중</Button>
                  <Button variant="outlined" color="error" size="medium" sx={{mr: 2}} onClick={() => filterData(4)}>만료</Button>
                </Grid>
                <ScrollX>
                    {
                        filteredData.length > 0 &&
                        <ReactTable columns={columns} data={filteredData} setSelectedRow={setSelectedRow} selectedRow={selectedRow} />
                    }
                </ScrollX>
                </Paper>
            </Grid>

            <Grid item xs={3}>
                <Paper elevation={3} style={{ padding: 20 }} className="sticky-box">
                    <SubscribeInfo updateData={selectedRow?.original} getSubscribeList={getSubscribeList} />
                </Paper>
            </Grid>

        </Grid>
    )
}

export default SubscribeList;