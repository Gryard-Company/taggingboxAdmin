import { Fragment, useEffect, useMemo, useState } from "react"
import axios from "utils/axios"

import { format } from 'date-fns';

const { Grid, Paper, Stack, Table, TableHead, TableRow, TableCell, TableBody, useTheme, useMediaQuery, Button } = require("@mui/material") // eslint-disable-next-line
import { alpha } from '@mui/material/styles';
import { useFilters, useExpanded, useGlobalFilter, useRowSelect, useSortBy, useTable, usePagination } from 'react-table';

import {
    CSVExport,
    HeaderSort,
    // IndeterminateCheckbox,
    // SortingSelect,
    TablePagination,
    TableRowSelection
  } from 'components/third-party/ReactTable';
import ScrollX from "components/ScrollX";
import AddMember from "sections/member/AddMember";


import { GlobalFilter } from 'utils/react-table';
  
// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, setSelectedRow, selectedRow }) {
    console.log(selectedRow);
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
        setHiddenColumns(['']);
      } else {
        setHiddenColumns(['']);
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
          <Stack className="table-top"
            direction={matchDownSM ? 'column' : 'row'}
            spacing={1}
            justifyContent="space-between"
            alignItems="center"
            sx={{ p: 3, pb: 0 }}
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
                        if (cell.column.id === 'memRegister' || cell.column.id === 'memLastLogin') {
                            return (
                                <TableCell key={cell} {...cell.getCellProps([{ className: cell.column.className }])}>
                                { cell.value ? format(new Date(cell.value),'yyyy-MM-dd H:mm:ss') : ''}
                                </TableCell>
                            )
                        } else {
                            return(
                                <TableCell key={cell} {...cell.getCellProps([{ className: cell.column.className }])}>
                                {cell.render('Cell')}
                                </TableCell>
                            )
                        }
                      })}
                    </TableRow>
                  </Fragment>
                );
              })}
              <TableRow sx={{ '&:hover': { bgcolor: 'transparent !important' }}}>
                <TableCell sx={{ p: 2, py: 3, paddingLeft: '0 !important', paddingRight: '0 !important' }} colSpan={9}>
                  <TablePagination gotoPage={gotoPage} rows={rows} setPageSize={setPageSize} pageSize={pageSize} pageIndex={pageIndex} />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Stack>
      </>
    );
}

// ==============================|| Memberlist - LIST ||============================== //

const MemberList = () => {

    const [memberList, setMemberList] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    

    const getMemberList = () => {
        
        let param = {} // 검색,필터
        
        axios.post('api/admin/member-list',param).then((res)=>{
            console.log(res.data.list)
            setMemberList(res.data.list);
        });
    }

    useEffect(()=>{
        getMemberList();
    },[])

    const columns = useMemo(
        () => [
          {
            Header: '아이디',
            accessor: 'memUserid'
          },
          {
            Header: '닉네임',
            accessor: 'memUsernm'
          },
          {
            Header: '최근 로그인일자',
            accessor: 'memLastLogin'
          },
          {
            Header: '가입일자',
            accessor: 'memRegister'
          },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
      );

    return (
        <Grid container spacing={2} className="mem-wp">
            {/* 첫 번째 영역 */}
            <Grid item xs={8}>
                <Paper elevation={3} style={{ padding: 20, minHeight: '702px' }}>
                <ScrollX>
                    {
                        memberList.length > 0 &&
                        <ReactTable columns={columns} data={memberList} setSelectedRow={setSelectedRow} selectedRow={selectedRow} />
                    }
                </ScrollX>
                </Paper>
            </Grid>

            {/* 두 번째 영역 */}
            <Grid item xs={4}>
                <Paper elevation={3} style={{ padding: 20 }} className="sticky-box">
                {
                    <AddMember user={selectedRow?.original} getMemberList={getMemberList}/>
                }
                </Paper>
            </Grid>
        </Grid>
    )
}

export default MemberList;