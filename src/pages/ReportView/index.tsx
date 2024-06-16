import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"

import { useSelector } from 'react-redux'

import { Row, Col, Layout, Typography } from 'antd';

import Markdown from 'react-markdown'


const {Content} = Layout;

  interface Config{
    visible: boolean,
    label: string,
    editDashboard: boolean,
    report: any,
    query_config: any,
    result_config: any
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
          setConfig({...config, report:data[0], query_config: data[1], result_config: data[2]});
          
        }).catch( (err)  =>  {
          console.log(err)
        
        })

      }, [])


      return (
        <>
          <Content style={{marginLeft: 20}}>
              <Content>
                <Typography.Title level={4}>Отчет</Typography.Title>
              </Content>
    
              <Row style={{width: '100%'}}>
                <Col span={24} style={{width: '100%'}}>
                  <pre>{config. report}</pre>
                </Col>
              </Row>

          </Content>
        </>
      )

  }

  export default ReportView;