import {useState,  useEffect} from'react'
import {Layout, Button, Typography, Table, Tooltip, Tag} from 'antd'
import { useNavigate } from "react-router-dom"

import { LinkOutlined } from '@ant-design/icons'

const {Content} = Layout

interface Config{
    visible: boolean
    use_internet?: boolean
}

const ReportList = () => {
    const navigate = useNavigate()

    const [config, setConfig]  =  useState<Config>({visible: false})
    const [inputs, setInputs]   =  useState({question: '', temperature: 5})
    const [reports, setReports] =  useState([])


    const fetchReportList  =  async ()  =>  {

        const response  = await fetch(`http://localhost:8000/api/report_list` );
        const json  = await response.json();

        return json;
    }

    useEffect(() => {
        fetchReportList().then(  reports   =>  setReports(reports)).catch(  error   =>  console.log(error));
    }, [])

    const link_render = (obj:any, record:any) => { 
        return (
            <Button type="link" onClick={ () => {  navigate('/new_dashboard',{state:{id: record.id}}) }}><LinkOutlined /></Button> 
        )}

    const questions_render  =  (obj:any, record:any)  =>  {
        return (
           <Tooltip placement="topLeft"  title={ JSON.parse( (record.questions || [])).reduce( (r:string, e:any) => r + '\n' + e, "") } ><LinkOutlined /> </Tooltip>
        )
    
    }

    const alt_questions_render = (obj:any, record:any)   =>   {
        const questions   =  JSON.parse(  (record.questions  ||  []));

        const q = questions.map(  (e:string)  =>  { return <Tag><span style={{width: 20, whiteSpace: 'collapse'}}>{e}</span></Tag>} )
        
        return (q)

    }

    const columns = [
        {key: "query", dataIndex: "query", title: "Query"}, 
        {key: 'questions', dataIndex: "questions", title: "Questions", render: alt_questions_render}, 
        {key: "params", dataIndex: "params", title: "Params"}, 
        {key: "link", dataIndex: "id", title: "Link", render:link_render }]   

    return (
        <>
            <Content>


                <Table columns={columns} dataSource={reports} />

                
           </Content>
            
        </>
    )
}

export default ReportList