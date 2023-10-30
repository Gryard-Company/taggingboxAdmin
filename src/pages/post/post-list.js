import { Fragment, useEffect, useMemo, useState } from "react"
import axios from "utils/axios";
import { format } from 'date-fns';

const { Grid, Paper, Stack, Table, TableHead, TableRow, TableCell, TableBody, useTheme, useMediaQuery, Button } = require("@mui/material") // eslint-disable-next-line
import { alpha } from '@mui/material/styles';
import { useFilters, useExpanded, useGlobalFilter, useRowSelect, useSortBy, useTable, usePagination } from 'react-table';

import {
    HeaderSort,
    TablePagination,
    TableRowSelection
  } from 'components/third-party/ReactTable';
import ScrollX from "components/ScrollX";
import AddPost from "sections/page/AddPost";

import { GlobalFilter } from 'utils/react-table';

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, setSelectedRow, selectedRow, postType }) {

  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  
    const sortBy = { id: 'bnSort', desc: false };
    
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        setHiddenColumns,
        rows,
        page,
        gotoPage,
        setPageSize,
        state: { globalFilter, selectedRowIds, pageIndex, pageSize },
        preGlobalFilteredRows,
        setGlobalFilter
    } = useTable(
      {
        columns,
        data,
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
    }, [matchDownSM]);

    // 선택 이벤트
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
            sx={{ p: 3, pb: 0, paddingLeft: '0 !important', paddingRight: '0 !important' }}
          >
            <GlobalFilter preGlobalFilteredRows={preGlobalFilteredRows} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} sx={{minWidth: '300px'}} />
            <Stack direction={matchDownSM ? 'column' : 'row'} alignItems="center" spacing={2}>
              {
                postType !== 'qna' &&
                <Button onClick={() => setSelectedRow(null)} color="warning" size="large" variant="contained" className="btn-new">새로 생성하기</Button>
              }
            </Stack>
          </Stack>
          <Table {...getTableProps()}>
            <TableHead>
              {headerGroups.map((headerGroup) => (
                <TableRow key={headerGroup} {...headerGroup.getHeaderGroupProps()}
                >
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
                        if(cell.column.id === 'num') {
                          return (
                            <TableCell key={cell} {...cell.getCellProps([{ className: cell.column.className }])}>
                            {i + 1}
                            </TableCell>
                          )
                        } if (cell.column.id === 'input_dt') {
                          return (
                              <TableCell key={cell} {...cell.getCellProps([{ className: cell.column.className }])}>
                              { cell.value ? format(new Date(cell.value),'yy-MM-dd H:mm:ss') : ''}
                              </TableCell>
                          )
                        } else if (cell.column.id === 'answered') {
                          return (
                              <TableCell key={cell} {...cell.getCellProps([{ className: cell.column.className }])}>
                              { cell.row?.original?.answer_id ? '답변 완료' : '미답변' }
                              </TableCell>
                          )
                        } else {
                          return (
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
                <TableCell sx={{ p: 2, py: 3, paddingLeft: '0 !important', paddingRight: '0 !important' }} colSpan={12}>
                  <TablePagination gotoPage={gotoPage} rows={rows} setPageSize={setPageSize} pageSize={pageSize} pageIndex={pageIndex} />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Stack>
      </>
    );
}

// ==============================|| LIST ||============================== //

const List = () => {

    const [list, setList] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);

    const [postType, setPostType] = useState('faq');
    
    const getList = () => {

      axios.get('api/admin/post-list/' + postType).then((response) => {
        if(response.data.code === 0) {
            console.log(response.data.list);
          setList(response.data.list);
        }
      }).catch((error) => {
        console.log(error)
      })
    }

    useEffect(()=>{
        setSelectedRow(null);
        getList();
    },[postType])

    const faqColumns = useMemo(
        () => [
          {
            Header: '',
            accessor:'num',
          },
          {
            Header: '카테고리',
            accessor: 'postCategory'
          },
          {
            Header: '제목',
            accessor: 'postTitle'
          },
          {
            Header: '작성 일자',
            accessor: 'inputDt'
          }
        ],
      );

    const qnaColumns = useMemo(
      () => [
        {
          Header: '',
          accessor:'num',
        },
        {
          Header: '이름',
          accessor: 'contName'
        },
        {
          Header: '회사명',
          accessor: 'contCompany'
        },
        {
          Header: '이메일',
          accessor: 'contEmail'
        },
        {
          Header: '작성 일자',
          accessor: 'inputDt',
          Cell: ({row}) => {
            const {values} = row;

            if(values?.inputDt != null) console.log(values.inputDt);
            if(values?.inputDt != null) console.log(new Date(values.inputDt) == 'Invalid Date');
            return (
               <>{ values?.inputDt ? new Date(values.inputDt) == 'Invalid Date' ? values.inputDt : format(new Date(values.inputDt),'yyyy-MM-dd hh:mm:ss') : ''}</>
            )
        }
        }
      ],
    );

    return (
        <Grid container spacing={2}>
            <Grid item xs={8}>
            <Paper elevation={3} style={{ padding: 20, minHeight: '590px' }}>
                <Grid className="btn-tabs" style={{display: 'flex',alignItems: 'center',gap: '10px'}}>
                    <Button sx={{mr: 1}} className={postType === 'faq' ? "active" : ""} color={postType === 'faq' ? "secondary" : "secondary"} size="large" variant="contained" onClick={() => setPostType('faq')}>자주묻는질문</Button>
                    <Button sx={{mr: 1}} className={postType === 'qna' ? "active" : ""} color={postType === 'qna' ? "secondary" : "secondary"} size="large" variant="contained" onClick={() => setPostType('qna')}>1:1 문의</Button>
                </Grid>
                
                {/* 테이블 영역 */}
                <ScrollX>
                    <ReactTable columns={postType === 'faq' ? faqColumns :qnaColumns} postType={postType} data={list} setSelectedRow={setSelectedRow} selectedRow={selectedRow} />
                </ScrollX>
            </Paper>
            </Grid>
            
            {/* 두 번째 영역 */}
            {
              <Grid item xs={4}>
                  <Paper elevation={3} style={{ padding: 24}} className="sticky-box">
                      <AddPost item={selectedRow?.original} getList={getList} type={postType} setSelectedRow={setSelectedRow}/>
                  </Paper>
              </Grid>
             }
        </Grid>
    )
}

export default List;