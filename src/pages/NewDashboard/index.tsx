import { useEffect, useRef, useState, useMemo, createRef, LegacyRef} from "react";
import { useNavigate, useLocation } from "react-router-dom"
import { useLoaderData } from "react-router-dom"
import update  from 'immutability-helper'
import { useSelector } from 'react-redux'

import { useSize } from "ahooks"

import { Drawer, Menu, MenuProps, Row, Col, Layout, Flex, Button, Divider, Typography, Modal, Input, Steps } from 'antd';

import RGL, { WidthProvider } from "react-grid-layout";
import  GridLayout  from 'react-grid-layout';
import { Table } from 'antd';

import Markdown from 'react-markdown'



import './index.css';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

const WidthGridLayout = WidthProvider(RGL);

type MenuItem = Required<MenuProps>['items'][number]

const { Content } = Layout;

const DEFAULT_LAYOUT = {"w": 8, "h": 9, "x": 0, "y": 0, "i": "", "minW": 3, "maxW": 20, "minH": 3, "maxH": 9, "moved": false, "static": false};


export async function loader( {params}:any ) {
    //return params.id;
    return 5
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

  interface State{
    id: number,
  }
  const NewDashboard = () => {

      const navigate = useNavigate();

      const {state}  =  useLocation();
      const {id} = state;

      
  
      const user = useSelector((state: any) => state.user.value);
      //if(user.name == "") navigate('/login')
  
      const [inputs, setInputs] = useState<Inputs>({} as Inputs);
      const [config, setConfig]  = useState<Config>({} as Config);
      const [local, setLocal]   = useState<LocalItem[]>([]);
      const [height, setHeight]  = useState<number[]>([]);
  
      useEffect(() => { setInputs({question: "", questionTheme: {}} as Inputs)  },  []);
  
      const layout_ref = useRef<GridLayout>(null);


      const fetchQuestionThemes = async () => {
        const response = await fetch('http://localhost:8000/api/question_themes');
        const json = await response.json();
        //const res = json.reduce( (r: string[], e: {table_schema: string}) => [...r, e.table_schema], [])
        setConfig({...config, questionThemes: json as QuestionTheme[] })
        
      }

      const fetchRawDashboardData = async  ()  =>  {

        const response  = await fetch('http://localhost:8000/api/raw_dashboard_data?query_id='+id);
        const json  = await response.json();

        const new_locals = json.map(  (item:any, index: number)  =>  {
            return {
            index: index,
            id:   index,
            name: index,
            label: item.question,
            layout: {...DEFAULT_LAYOUT, i: item.name},
            layout_type: item.type,
            height: DEFAULT_LAYOUT.h * 50,
            content: item.content,

            }
        })

        setLocal(new_locals);

        localStorage.setItem('local', JSON.stringify(new_locals))
       
      }

      //useMemo(()=>{ fetchQuestionThemes() }, []);

      useEffect(()=>{fetchRawDashboardData()}, []);

      
      const onResize = (newLayout: any) => {
    
        const l = JSON.parse(JSON.stringify(local));
        newLayout.map( (item:any) => {
          const i = l.findIndex( (e:LocalItem) => 'layout_'+e.name == item.i);
          l[i].height = item.h * 50 - 30;
          l[i].layout = item;
        })
        setLocal(l);
        
        // const hh = l.map( (item:LocalItem) => item.height)
        // setHeight(hh);
        // localStorage.setItem('local', JSON.stringify(l))
      }



      const grid_layout = local.map( (item:LocalItem, i:number) => {
        switch(item.layout_type){
            case "dates":{
              
                return (
                  <Content  key={`layout_${i}`} data-grid={item.layout}   >
                    <Content style={{height: item.height, overflowY: 'auto'}}>
                      <Steps direction="vertical" progressDot
                           style={{ }}
                            current={JSON.parse(item.content).length} items={ JSON.parse(item.content).map( (e: any) => {return {"title": e.key, "description": e.value}}) }/>
                    </Content>
                  </Content>

                )
            }
            case "table":{
              const content = JSON.parse(item.content)

              return (
                   <Content  key={`layout_${i}`} data-grid={item.layout} style={{height: item.height}}>
                    <Table size="small" scroll={ {y: item.height } } tableLayout='auto' columns={[{key:'parameter', dataIndex:"parameter", title: 'Parameter'},{ key:'value', dataIndex:'value', title: 'Value'}]} dataSource={content} pagination={false} />
                     {/* <Content>{item.content}</Content> */}
                   </Content>
              )

            }
            case "summarization":{
              return (
                   <Content  key={`layout_${i}`} data-grid={item.layout} style={{height: item.height}}>
                    <Markdown>{item.content}</Markdown>
                   </Content>
              )
            
            }
        }

        return (
            <Content key={`layout_${i}`} data-grid={item.layout}>
                {/* <Markdown > { item.content } </Markdown> */}
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



      
        </>
      )

  }

  export default NewDashboard;