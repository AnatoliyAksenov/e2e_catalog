import {useState, useRef, useEffect} from'react'
import {Layout, Button, Modal, Input, Checkbox, Slider, Form, Upload,  UploadFile, Card, Avatar, Skeleton, Row, Col, Typography} from 'antd'
import { useNavigate } from "react-router-dom"

import {SettingOutlined, EditOutlined, EllipsisOutlined, RightSquareOutlined} from '@ant-design/icons';


import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-django";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools"

import browse from '../../assets/browse-svgrepo-com.svg'
import date from '../../assets/date-svgrepo-com.svg'
import document from '../../assets/document-svgrepo-com.svg'
import inspiration from '../../assets/inspiration-svgrepo-com.svg'
import picture from '../../assets/picture-svgrepo-com.svg'
import target from '../../assets/target-svgrepo-com.svg'

const {Content} = Layout

const {Meta} = Card;

interface EditorConfig{
  template: string,
}

interface Config{
    visible: boolean,
    editor_visible?: boolean,    
    editor_key?: string,
    use_internet?: boolean,
    editor_configs: {[key: string]:EditorConfig}
}



const Welcome = () => {

    const navigate = useNavigate()

    const [config, setConfig]  =  useState<Config>({visible: false, editor_configs: {}})
    const [inputs, setInputs]   =  useState({question: '', temperature: 0.1, editor: ''})
    const [items, setItems] = useState<any[]>([])

    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const upload = useRef<typeof Upload>(null)
    const [form] =   Form.useForm()

    const [questionTheme, setQuestionTheme] = useState('Финансы')


    useEffect(()  => {
      const template_data = {
        'simple_rules': {
          "template": "Super simple template for jinja2"
        }
      }
      setConfig({...config, editor_configs: template_data})
    }, [])

    const fetchNewQuestion  =  async ()  =>  {

        const init = {
            method: "POST", 
            body: JSON.stringify({
                question: inputs.question,
                temperature: inputs.temperature,
                use_internet: config.use_internet,
                files: fileList.map((file) => file.response.key)

            })
        }
        
        const response  = await fetch(`http://localhost:8000/api/process_query`, init );
        const json  = await response.json();

        return json;
    }

    

    const fetchSaveTemplate  =  async ()  =>  {

      const init = {
          method: "POST", 
          body: JSON.stringify({
              template_key: config.editor_key,
              template: inputs.editor

          })
      }
      
      const response  = await fetch(`http://localhost:8000/api/save_template`, init );
      const json  = await response.json();

      return json;
    }

    const onUploadChange = (info:any) => {
        console.log("onUploadChange: ", info);
        setFileList([...info.fileList]);
    };

    const onOk = () => {
        fetchNewQuestion().then((data)  => {
            setItems([...items,data as any])
            setConfig({...config, visible: false}); 
        }).catch( (error:any) => {
            console.log(error);
        }).finally(()=> {
            console.log('New Question finally')
        })
        
    }

    const onSaveEditor  =  ()  =>  {
          fetchSaveTemplate().then((data)   =>  {
            
          })
    }
    

    const configEditor = (key: string) => {

      const template = config.editor_configs[key].template || '';

      setInputs({...inputs, editor: template }); 
      setConfig({...config, editor_visible: true, editor_key: key}); 
    }

    return (
        <>
            <Content>
                <h1>Welcome to the <strong style={{color: 'white', backgroundColor: '#A0A0A0', padding: '2px'}}>E2E</strong>Catalog</h1>

                <Row justify="center" gutter={[16,16]}>
                    <Col>
                    <Card
                      style={{ width: 400, marginTop: 26 }}
                      actions={[
                        <RightSquareOutlined key="run" />,
                        <SettingOutlined key="setting" />,
                        <EditOutlined key="edit" onClick={() => { configEditor('simple_rules') } }/>,
                      ]}
                    >
                      
                        <Meta
                          avatar={<Avatar src={browse} style={{width: 90, height: 90}}/>}
                          title="Search by simple rules"
                          description="Description of the question"
                        />
                     
                    </Card>
                    </Col>
                    <Col>
                    <Card
                      style={{ width: 400, marginTop: 26 }}
                      actions={[
                        <RightSquareOutlined key="run" />,
                        <SettingOutlined key="setting" />,
                        <EditOutlined key="edit" />,
                      ]}
                    >
                      
                        <Meta
                          avatar={<Avatar src={date} style={{width: 90, height: 90}}/>}
                          title="Search by simple rules"
                          description="Description of the question"
                        />
                     
                    </Card>
                    </Col>
                    <Col>
                    <Card
                      style={{ width: 400, marginTop: 26 }}
                      actions={[
                        <RightSquareOutlined key="run" />,
                        <SettingOutlined key="setting" />,
                        <EditOutlined key="edit" />,
                      ]}
                    >
                      
                        <Meta
                          avatar={<Avatar src={document} style={{width: 90, height: 90}}/>}
                          title="Search by simple rules"
                          description="Description of the question"
                        />
                     
                    </Card>
                    </Col>
                </Row>
                <Row justify="center">
                    <Col >
                        <Card
                          style={{ width: 400, marginTop: 26 }}
                          actions={[
                            <RightSquareOutlined key="run" />,
                        <SettingOutlined key="setting" />,
                        <EditOutlined key="edit" />,
                          ]}
                        >
                          
                            <Meta
                              avatar={<Avatar src={inspiration} style={{width: 90, height: 90}}/>}
                              title="Search by simple rules"
                              description="Description of the question"
                            />
                         
                        </Card>
                    </Col>
                    <Col>
                    <Card
                      style={{ width: 400, marginTop: 26 }}
                      actions={[
                        <RightSquareOutlined key="run" />,
                        <SettingOutlined key="setting" />,
                        <EditOutlined key="edit" />,
                      ]}
                    >
                      
                        <Meta
                          avatar={<Avatar src={picture} style={{width: 90, height: 90}}/>}
                          title="Search by simple rules"
                          description="Description of the question"
                        />
                     
                    </Card>
                    </Col>
                </Row>


                <Button onClick={ ()  =>  { setConfig({...config, visible: true}) }}> new question</Button>

            </Content>
            <Modal title="New question" open={config.visible} onOk={ onOk } okText="Run" destroyOnClose={false} onCancel={ () =>{ setConfig({...config, visible: false}) }} cancelText="CLose" width={650}>
                <Form layout='horizontal'>
                    <Form.Item label="Question" labelCol={{span: 6}}   >
                    <Input placeholder="Enter your question" onChange={ (e:any) => setInputs({...inputs, question: e.target.value})}/>      
                    </Form.Item>
                    
                    <Form.Item label="Use Internet search"  labelCol={{span: 6}} >
                    <Checkbox value={false} onChange={( e:any)  => setConfig({...config, use_internet: e.target.value}) }> Use Internet search</Checkbox>
                    </Form.Item>
    
                    <Form.Item label="Themperature"  labelCol={{span: 6}} >
                      <Slider min={0.1} max={1} step={0.1} onChange={(e:any)  => setInputs({...inputs, temperature: e}) } defaultValue={.5} />
                    </Form.Item>

                    <Form.Item label="Text files" getValueFromEvent={(e:any)   => setFileList(e.fileList)  }>
                        <Upload accept='application/docx' action='http://localhost:8000/api/uploadfile/' ref={upload} onChange={onUploadChange}> PDF or DOCX files</Upload>
                    </Form.Item>

                </Form>
            </Modal>

            <Modal open={config.editor_visible} title="Template editor" width={1000} onCancel={ () => {setConfig({...config, editor_visible: false})  }} okText="Save" onOk={ onSaveEditor }>
                <Typography.Title level={5}>Template editor (Jinja2)</Typography.Title>

                <AceEditor
                  mode="java"
                  theme="github"
                  onChange={ (value) =>  { setInputs({...inputs, editor: value}) } }
                  name="acedEditor"
                  editorProps={{ $blockScrolling: true }}
                  setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: true
                  }}
                  value={inputs.editor}
                />
                <Typography.Link href='https://jinja.palletsprojects.com/en/3.1.x/api/#basics' target='_blank'>Jinja 2 documentation</Typography.Link>
            </Modal>
        </>
    )
  }

export default Welcome