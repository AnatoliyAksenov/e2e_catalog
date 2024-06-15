import { useEffect, useRef, useState, useMemo, createRef, LegacyRef} from "react";
import { useNavigate, useLocation } from "react-router-dom"
import { useLoaderData } from "react-router-dom"
import update  from 'immutability-helper'
import { useSelector } from 'react-redux'

import { useSize } from "ahooks"

import { Drawer, Menu, MenuProps, Row, Col, Layout, Flex, Button, Divider, Typography, Modal, Input, Steps,  } from 'antd';


import { Table } from 'antd';

import Markdown from 'react-markdown'


const {Content} = Layout;



  interface Config{
    visible: boolean,
    label: string,
    editDashboard: boolean,
    report: any,
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
          setConfig({...config, report:data});
          
        }).catch( (err)  =>  {
          console.log(err)
        
        })

      }, [])

      

      return (
        <>
          <Content style={{marginLeft: 20}}>
          <Content>
            <Typography.Title level={4}>{config.label}</Typography.Title>
          </Content>
          <Divider />

          <Row style={{width: '100%'}}>
            <Col span={24} style={{width: '100%'}}>

            </Col>
          </Row>

    </Content>



      
        </>
      )

  }

  export default ReportView;