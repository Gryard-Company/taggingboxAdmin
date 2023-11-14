import { Fragment, useEffect, useMemo, useState } from "react"
import axios from "utils/axios"

import { format, isSameDay, isBefore, isPast, differenceInMonths, isWithinInterval } from 'date-fns';

const { Grid, Paper, TableRow, TableCell, TableBody, TableHead, useTheme, useMediaQuery, Stack, Table, Button, Typography, TextField, FormControl, Select, MenuItem } = require("@mui/material")
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
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ko from 'date-fns/locale/ko';

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
              {/* <Button onClick={() => setSelectedRow(null)} color="warning" size="large" variant="contained" className="btn-new">새로 생성하기</Button> */}
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
    // const [tabActive, setTabActive] = useState(1);

    // 검색 항목
    const [ status, setStatus ] = useState(1);
    const [ startDate, setStartDate ] = useState(null);
    const [ endDate, setEndDate ] = useState(null);

    const handleStatue = (event) => {
      setStatus(event.target.value);
    }
    const handleStartDate = (event) => {
      setStartDate(event);
    }
    const handleEndDate = (event) => {
      setEndDate(event);
    }

    const search = () => {
      let filterData;
        
      // 1. 상태별 필터
      switch(status){
          // 전체
          case 1:
              filterData = subscribeList;
              break;
      
          //사용
          case 2:
              filterData = subscribeList.filter((row) => isBefore(new Date(),new Date(row.next_payment_date))
              );
              break;
          //만료
          case 3:
              filterData = subscribeList.filter((row) =>  !isSameDay(new Date(),new Date(row.next_payment_date)) && isPast(new Date(row.next_payment_date))
              );
              break;
          //만료
          case 4:
              filterData = subscribeList.filter((row) =>  row.subscribe_type == 'basic');
              break;
      }

      // 2. 기간별 필터
      let dateFilterDate;
      if(startDate == null && endDate == null){
        setFilteredData(filterData);
        return;
      } else if(startDate == null || endDate == null) {
        alert('기간을 설정해 주세요.');
        return;
      } else {
        console.log(filterData);
        dateFilterDate = filterData.filter((row) => isWithinInterval(new Date(row.first_payment_date),{start:new Date(startDate),end: new Date(endDate)}) )
      }

      console.log(dateFilterDate);
      

      setFilteredData(dateFilterDate);

    }
    const searchReset = () => {
      setStatus(1);
      setStartDate(null);
      setEndDate(null);

      setFilteredData(subscribeList);
    }

    
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
                    case 'PREMIUM_MONTHLY':
                        subscribe_type = 'Premium(월결제)'
                        break;

                    case 'PREMIUM_SUPER':
                        subscribe_type = 'Premium(관리자)'
                        break;

                    case 'ENTERPRISE':
                        subscribe_type = 'Enterprise'
                        break;
                    case 'basic':
                        subscribe_type = 'Basic'
                        break;
                }
                return (
                    <>{ values?.subscribe_type ? subscribe_type : ''}</>
                )
            }
          },
          {
            Header: '마지막 주문ID',
            accessor: 'last_order_id',
            Cell: ({row}) => {
              const {values} = row;
              return (
                <>{ values?.last_order_id ? values?.last_order_id  : (<Typography style={{'textAlign':'center'}}>-</Typography>)}</>
              )
          }
          },
          {
            Header: '최초 결제일',
            accessor: 'input_dt',
            Cell: ({row}) => {
                const {values} = row;
                return (
                   <>{ values?.input_dt ? format(new Date(values.input_dt),'yyyy-MM-dd') : '-'}</>
                )
            }
          },
          {
            Header: '다음 결제일',
            accessor: 'next_payment_date',
            Cell: ({row}) => {
                const {values} = row;
                return (
                   <>{ values?.next_payment_date ? format(new Date(values.next_payment_date),'yyyy-MM-dd') : '-'}</>
                )
            }
          },
          {
            Header: '구독 유지기간',
            accessor: 'subscribe_period',
            Cell: ({row}) => {
                const {values} = row;

                let monthsDifference = values.input_dt ? differenceInMonths(new Date(),new Date(values.input_dt)) : 0;

                return (
                   <>{ monthsDifference }개월</>
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
                    <>
                        {
                        values.subscribe_type == 'basic' ?
                        (<Typography style={{'color':'red'}}>미구독</Typography>)
                        :(
                        isSameDay(nextPaymentDate,today) ? 
                          <Typography style={{'color':'blue'}}>갱신일</Typography> : (isBefore(today,nextPaymentDate) 
                          ? 
                          (<Typography style={{'color':'green'}}>구독중</Typography>) : (<Typography style={{'color':'red'}}>만료</Typography>)))}
                    </>
                )
            }
          },

        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
    );
    
    // const filterData = (type) => {

    //     let filterData;
        
    //     switch(type){
    //         // 전체
    //         case 1:
    //             filterData = subscribeList;
    //             break;
        
    //         //사용
    //         case 2:
    //             filterData = subscribeList.filter((row) => isBefore(new Date(),new Date(row.next_payment_date))
    //             );
    //             break;
        
    //         //갱신일
    //         case 3:
    //             filterData = subscribeList.filter((row) => isSameDay(new Date(),new Date(row.next_payment_date))
    //             );
    //             break;
        
    //         //만료
    //         case 4:
    //             filterData = subscribeList.filter((row) =>  !isSameDay(new Date(),new Date(row.next_payment_date)) && isPast(new Date(row.next_payment_date))
    //             );
    //             break;
    //     }
        
    //     setFilteredData(filterData);
    // }
                     

    return (
        <Grid container spacing={2}>
            <Grid item xs={9}>
                <Paper elevation={3} style={{ padding: 20, minHeight: '590px' }}>

                  {/* 상단 검색 영역 */}
                  <Grid className="btn-tabs" style={{display: 'flex',alignItems: 'center',gap: '10px'}}>
                    <Stack spacing={1.25} sx={{width: '100px'}}>
                      <FormControl fullWidth>
                          <Select labelId="demo-simple-select-label" 
                          value={status} onChange={handleStatue} defaultValue={1}>
                              <MenuItem value={1}>전체</MenuItem>
                              <MenuItem value={2}>구독중</MenuItem>
                              <MenuItem value={3}>만료</MenuItem>
                              <MenuItem value={4}>미구독</MenuItem>
                          </Select>
                      </FormControl>
                    </Stack>

                    <LocalizationProvider dateAdapter={AdapterDateFns}
                       adapterLocale={ko}>
                      <DesktopDatePicker
                      format="yyyy-MM-dd"
                      name='next_payment_date'
                      value={startDate} onChange={handleStartDate}
                      renderInput={(params) => <TextField {...params} />}
                       sx={{width: '200px'}}
                      />
                      ~
                      <DesktopDatePicker
                      format="yyyy-MM-dd"
                      name='next_payment_date'
                      value={endDate} onChange={handleEndDate}
                      renderInput={(params) => <TextField {...params} />}
                       sx={{width: '200px'}}
                      />
                    </LocalizationProvider>

                    <Button type="button" variant="contained" size="large" onClick={()=>search()} sx={{height: '48px'}}>
                      목록 필터설정
                    </Button>
                    <Button type="button" variant="contained"size="large" color="secondary" onClick={()=>searchReset()} sx={{marginLeft: 'auto', opacity: '.4'}}>
                      초기화
                    </Button>
                  </Grid>

                  {/* 테이블 영역 */}
                  <ScrollX>
                      {
                        filteredData.length > 0 ?
                        <ReactTable columns={columns} data={filteredData} setSelectedRow={setSelectedRow} selectedRow={selectedRow} />
                        :
                        <Grid className="tbl-nodata">해당 테이블에 일치하는 데이터가 없습니다.</Grid>
                      }
                  </ScrollX>
                  {/* 빈값 */}
                  
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