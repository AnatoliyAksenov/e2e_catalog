import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"

import { useSelector } from 'react-redux'

import { Row, Col, Layout, Typography, Menu, MenuProps } from 'antd';

import Markdown from 'react-markdown'

import Plot from '../../components/Plot'
import { set } from "lodash";

type MenuItem = Required<MenuProps>['items'][number]


const {Content} = Layout;

  interface Config{
    visible: boolean,
    label: string,
    editDashboard: boolean,
    report: any,
    query_config: any,
    query_data: any,
    result_config: any,
    chart: any,
    code: number,
    chart_type: string,
  }

  interface Inputs{
    question: string,
  }

  interface State{
    id: number,
  }
  const ReportView = () => {

      const navigate = useNavigate();

      const {state}  =  useLocation();
      const {id} = state;

  
      const user = useSelector((state: any) => state.user.value);
      //if(user.name == "") navigate('/login')
  

      const [config, setConfig]  = useState<Config>({} as Config);

  
      const fetchQuestioReport = async (id:string) => {
        const response = await fetch(`http://localhost:8000/api/question_report/${id}`);
        const json = await response.json();

        return json;
      }


      useEffect(() => {
        fetchQuestioReport(id).then( (data)  => {
          const query_data = data[1].table_data;
          //data[1].table_data.map( (e) => {return {"year": e.year, "param": e.data[1100]}})

          setConfig({...config, report:data[0], query_config: data[1], result_config: data[2], query_data: query_data, code: 1100, chart_type: 'line_chart'});
          
          
        }).catch( (err)  =>  {
          console.log(err)
        
        })

      }, [])

      const params:any = {
        data: config.query_data?.map( (e:{year:string, data: number[]}) => {return {"year": e.year, "param": e.data[config.code||1100]}}), 
        x: 'year', 
        y: 'param', 
        chart_type: config.chart_type, 
        height: 500, 
        ys: ['param']}
        ;

      const menu_items: MenuItem[] = [
        { 
          key: 'code', 
          label: "Код бух отчетности "+ config.code, 
          children: [
            {key: '1100',  label: '1100', onClick: ()=> {setConfig({...config, code: 1100})}},
            {key: '1200',  label: '1200', onClick: ()=> {setConfig({...config, code: 1200})}},
            {key: '1300',  label: '1300', onClick: ()=> {setConfig({...config, code: 1300})}},
            {key: '1400',  label: '1400', onClick: ()=> {setConfig({...config, code: 1400})}},
            {key: '1500',  label: '1500', onClick: ()=> {setConfig({...config, code: 1500})}},
            {key: '1600',  label: '1600', onClick: ()=> {setConfig({...config, code: 1600})}},
            {key: '1700',  label: '1700', onClick: ()=> {setConfig({...config, code: 1700})}},
            {key: '2100',  label: '2100', onClick: ()=> {setConfig({...config, code: 2100})}},
          ]
        },
        { 
          key: 'chart', 
          label: "Тип диаграммы "+ config.chart_type, 
          children: [
            {key: 'line_chart',  label: 'line_chart', onClick: ()=> {setConfig({...config, chart_type: 'line_chart'})}},
            {key: 'bar_chart',  label: 'bar_chart', onClick: ()=> {setConfig({...config, chart_type: 'bar_chart'})}},
            {key: 'area_chart',  label: 'area_chart', onClick: ()=> {setConfig({...config, chart_type: 'area_chart'})}},
            {key: 'pie_chart',  label: 'pie_chart', onClick: ()=> {setConfig({...config, chart_type: 'pie_chart'})}},
            {key: 'donut_chart',  label: 'donut_chart', onClick: ()=> {setConfig({...config, chart_type: 'donut_chart'})}},
            {key: 'radar_chart',  label: 'radar_chart', onClick: ()=> {setConfig({...config, chart_type: 'radar_chart'})}},
          ]
        },
      ]


      return (
        <>
          <Content style={{marginLeft: 20}}>
              <Content>
                <Typography.Title level={4}>Отчет</Typography.Title>
              </Content>
    
              <Row style={{width: '100%'}}>
                <Col span={24} style={{width: '100%'}}>
                  <pre>{config.report}</pre>
                </Col>
              </Row>

              <Typography.Title level={4}>Табличные данные</Typography.Title>
              <Menu mode='horizontal' items={menu_items} />
              <Content>
                <Plot  {...params} />
              </Content>

          </Content>
        </>
      )

  }

  export default ReportView;