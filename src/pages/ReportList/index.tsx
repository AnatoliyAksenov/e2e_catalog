import {useState,  useEffect} from'react'
import {Layout, Button, Typography, Table, /*Tooltip,*/ Form} from 'antd'
import { useNavigate } from "react-router-dom"

import { LinkOutlined,CheckSquareOutlined, CloseSquareOutlined } from '@ant-design/icons'
import { Dictionary } from 'lodash'

const {Content} = Layout

// interface Config{
//     visible: boolean
//     use_internet?: boolean
// }

const ReportList = () => {
    const navigate = useNavigate()

    //const [config, setConfig]  =  useState<Config>({visible: false})
    //const [inputs, setInputs]   =  useState({question: '', temperature: 5})
    const [reports, setReports] =  useState([])


    const fetchReportList  =  async ()  =>  {

        const response  = await fetch(`/api/report_list` );
        const json  = await response.json();

        return json;
    }

    useEffect(() => {
        fetchReportList().then(  reports   =>  setReports(reports)).catch(  error   =>  console.log(error));
    }, [])

    const link_render = (_obj:any, record:any) => { 
        return (
            <Button type="link" onClick={ () => {  navigate('/report_view',{state:{id: record.id}}) }}><LinkOutlined /></Button> 
        )}

    // const questions_render = (_obj:any, record:any)  =>  {
    //     return (
    //        <Tooltip placement="topLeft"  title={ JSON.parse( (record.questions || [])).reduce( (r:string, e:any) => r + '\n' + e, "") } ><LinkOutlined /> </Tooltip>
    //     )
    
    // }

    const labels:any= {'use_internet':'Использовать интернет', 'use_closed_resources': 'Использовать закрытые источники', 'inn':'ИНН', 'temperature':'Температура'}
    const query_types:any = {"simple_question": "Анализ контрагентов", "goods_analysis": "Анализ товаров", "chat": "Произвольный запрос", "marketing_insides": "Маркетинговый зпрос", "Innovations": "Инновации и технологии"}
    
    const alt_questions_render = (_obj:any, record:any)   =>   {
        const questions   =  JSON.parse(  (record.params  ||  '[]'));

        //const q = record.theme == 'simple_question' ? null: questions.map(  (e:string)  =>  { return <Tag><span style={{width: 20, whiteSpace: 'collapse'}}>{e}</span></Tag>} );
        const q = ['use_internet', 'use_closed_resources', 'inn', 'temperature'].map(   (e:string)   =>   {
            return (<tr>
                <td>{labels[e]}</td>
                <td>{  typeof questions[e] == 'boolean' ?  questions[e]?<CheckSquareOutlined />:<CloseSquareOutlined />: questions[e] }</td>
                </tr> )
        })
        return ( <table>{q}</table> )

    }

    const query_type_render  =  (_obj:any, record:any)  =>  {

        return (<Typography.Text>{ query_types[record.theme] }</Typography.Text>)
    }



    const columns = [
        {key: "id", dataIndex: "id", title: "#"},
        {key: "query", dataIndex: "query", title: "Запрос"}, 
        {key: "theme", dataIndex: "theme", title: "Тип запроса", render: query_type_render},
        {key: 'questions', dataIndex: "questions", title: "Параметры", render: alt_questions_render},         
        //{key: "params", dataIndex: "params", title: "Параметры"}, 
        {key: "link", dataIndex: "id", title: "Link", render:link_render }]


    return (
        <>
            <Content>
                <Typography.Title>Выполненыеы запросы</Typography.Title>

                <Table size='small' columns={columns} dataSource={reports} />
           </Content>
            
        </>
    )
}

export default ReportList