import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"
import update  from 'immutability-helper'
import { useSelector } from 'react-redux'

import { Drawer, Menu, MenuProps, Row, Col, Layout, Flex, Button, Divider, Typography, Modal, Input, FloatButton } from 'antd';

import RGL, { WidthProvider } from "react-grid-layout";
import  GridLayout  from 'react-grid-layout';
import { Table } from 'antd';




import {
  ImperativePanelGroupHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";

import './index.css';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

const WidthGridLayout = WidthProvider(RGL);

type MenuItem = Required<MenuProps>['items'][number]

const { Content } = Layout;

const DEFAULT_LAYOUT = {"w": 8, "h": 9, "x": 0, "y": 0, "i": "", "minW": 3, "maxW": 20, "minH": 3, "maxH": 9, "moved": false, "static": false};


export async function loader( {params}:any ) {
    return params.id;
  }


  interface Layout{
    w:number,
    h:number,
    x:number,
    y:number,
    i:string,
    minW:number,
    maxW:number,
    minH:number,
    maxH:number,
    moved:boolean,
    static:boolean
  }
  
  interface LocalItem{
    index:number,
    id: number,
    name: string,
    label: string,
    layout: Layout,
    layout_type: string,
    height: number,
    content: string
  }

  interface QuestionTheme{
    id: string,
    name: string,
    questions: string[],
  }

  interface Config{
    questionThemes: QuestionTheme[],
    visible: boolean,
    label: string,
    editDashboard: boolean,
  }

  interface Inputs{
    question: string,
    questionTheme: QuestionTheme,
  }

  const NewDashboard = () => {

    const navigate = useNavigate();

    const user = useSelector((state: any) => state.user.value);
    //if(user.name == "") navigate('/login')

    const [inputs, setInputs] = useState<Inputs>({} as Inputs);
    const [config, setConfig]  = useState<Config>({} as Config);
    const [local, setLocal]   = useState<LocalItem[]>([]);
    const [height, setHeight]  = useState<number[]>([]);



    useEffect(() => { setInputs({question: "", questionTheme: {}} as Inputs)  },  []);

    const layout_ref = useRef<GridLayout>(null);


    const fetchDatabases = async () => {
        const response = await fetch('http://localhost:8000/api/question_themes');
        const json = await response.json();
        //const res = json.reduce( (r: string[], e: {table_schema: string}) => [...r, e.table_schema], [])
        setConfig({...config, questionThemes: json as QuestionTheme[] })
        
      }
      useMemo(()=>{ fetchDatabases() }, []);

      const onResize = (newLayout: any) => {
    
        const l = JSON.parse(JSON.stringify(local));
        newLayout.map( (item:any) => {
          const i = l.findIndex( (e:LocalItem) => e.name == item.i);
          l[i].chart_height = item.h * 50;
          l[i].layout = item;
        })
        setLocal(l);
        
        const hh = l.map( (item:LocalItem) => item.height)
        setHeight(hh);
        localStorage.setItem('local', JSON.stringify(l))
      }

      const grid_layout = local.map( (item:LocalItem, i:number) => {
        return (
            <Content key={`layout_${i}`}>
                {item.content}
            </Content>
        )
      })

      return (
        <>
              <Content style={{marginLeft: 20}}>
        <Content>
          {/* <Menu mode="horizontal" items={menu_items} style={{ width: '100%' }} /> */}
          <Typography.Title editable={{tooltip: 'Edit dashboard label', onChange: ()=>{} }}  level={4}>{config.label}</Typography.Title>
        </Content>
        <Divider />

          <Row style={{width: '100%'}}>
            <Col span={24} style={{width: '100%'}}>
            <WidthGridLayout style={{minHeight: 1000, width: '100%', backgroundColor: '#F0F0F0'}}
              className="layout"  draggableCancel=".cancelSelectorName" isDraggable={config.editDashboard} isResizable={config.editDashboard} containerPadding={[10, 10]}  cols={12} rowHeight={50} width={1400} ref={layout_ref}
              onResize={ onResize }
            >
             
              { grid_layout }
             
            </WidthGridLayout>
            </Col>
          </Row>

    </Content>



      <Modal title="Interactive SQL Chat" open={config.visible} onOk={ ()=>{ setConfig({...config, visible: false}) }} okText="Process" destroyOnClose={false} onCancel={ () =>{ setConfig({...config, visible: false}) }} cancelText="Hide" width={650}>
        <Input placeholder="Enter your question" onChange={ (e) => setInputs({...inputs, question: e.target.value})}/>      
        
      </Modal>
        </>
      )

  }

  export default NewDashboard;