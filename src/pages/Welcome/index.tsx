import {useState, useRef, useEffect} from'react'
import {Layout, Button, Modal, Input, Checkbox, Slider, Form, Upload,  UploadFile, Card, Avatar, Table, Row, Col, Typography, Divider} from 'antd'
import { useNavigate } from "react-router-dom"

import {SettingOutlined, EditOutlined, EllipsisOutlined, RightSquareOutlined, PlusOutlined, MinusOutlined} from '@ant-design/icons';

import { useInterval } from "ahooks"

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
  question_values: QVariable[],
}

interface Config{
    visible: boolean,
    editor_visible?: boolean,    
    editor_key?: string,
    use_internet?: boolean,
    editor_configs: {[key: string]:EditorConfig},
    qlist_visible?: boolean,
    selection?: any,
    question_values?: QVariable[],
    company_visible?: boolean,
    waiting_visible?: boolean,
    waiting_success?: boolean,
}

interface QVariable{
  key: string,
  variable: string,
}



const Welcome = () => {

    const navigate = useNavigate()

    const [config, setConfig]  =  useState<Config>({visible: false, editor_configs: {}})
    const [inputs, setInputs]   =  useState({question: '', temperature: 0.1, editor: '', question_values: [] as QVariable[], waiting_id: null })
    const [items, setItems] = useState<any[]>([])

    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const upload = useRef<typeof Upload>(null)
    const [form] =   Form.useForm()

    const [questionTheme, setQuestionTheme] = useState('Финансы')


    // useEffect(()  => {
    //   const template_data = {
    //     'simple_rules': {
    //       "template": "Super simple template for jinja2"
    //     }
    //   }
    //   setConfig({...config, editor_configs: template_data})
    // }, [])

    const fetchQuestionsConfig  =  async ()  =>  {
      
      const response  = await fetch(`http://localhost:8000/api/questions_config` );
      const json  = await response.json();

      return json;
    }


    useEffect(()   =>  {
      fetchQuestionsConfig().then( (data) => {

        const conf = data.reduce( (r:any,e:any) => Object.assign(r, {[e.question_key]: e }), {})

        setConfig({...config, editor_configs: conf  })
      }).catch( (error) => {
        console.log(error)
      })

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

    const fetchCompanyQuestion  =  async ()  =>  {

      const init = {
          method: "POST", 
          body: JSON.stringify({
              question: inputs.question,
              question_key: config.editor_key,
              temperature: inputs.temperature,
              use_internet: config.use_internet,
              files: fileList.map((file) => file.response.key)

          })
      }
      
      const response  = await fetch(`http://localhost:8000/api/company_query`, init );
      const json  = await response.json();

      return json;
    }

    const fetchQuestionStatus  =  async ()  =>  {
      
      const response  = await fetch(`http://localhost:8000/api/question_status/${inputs.waiting_id}`  );
      const json  = await response.json();

      return json;
    }  

    useInterval(() => {
      if(!!inputs.waiting_id){
        
            fetchQuestionStatus().then((data)  => {
                setConfig({...config,  waiting_success: false})
            }).catch( (error) => {
                console.log(error)
            })
      }
      console.log(inputs.waiting_id)

    }, 1000)

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

    const onCompanyOk = ()  =>  {
      fetchCompanyQuestion().then((data)   =>  {
            //setItems([...items,data as any])
            setConfig({...config, company_visible: false, waiting_visible: true, waiting_success: true}); 
            setInputs({...inputs, waiting_id: data.id});
         }).catch(  (error:any)  =>  {
            console.log(error);
         }).finally(()=>  {
            console.log('Company Question finally')
         })
        
     
    }

    const onSaveEditor  =  ()  =>  {
          fetchSaveTemplate().then((data)   =>  {
            if(data == true){

              const ll = JSON.parse(JSON.stringify(config.editor_configs));
              ll[config.editor_key||''].template = inputs.editor;

              setConfig({...config, editor_configs: ll});
              setConfig({...config, editor_key: ''});

              //setConfig({...inputs, editor: ''});
              setConfig({...config, editor_visible: false})
            }
          })
          .catch( (error) => {
            console.log(error);
        
          })
    }
    

    const configEditor = (key: string) => {

      const template = config.editor_configs[key].template || '';
      const qv =  config.editor_configs[key].question_values;

      setInputs({...inputs, editor: template }); 
      setConfig({...config, editor_visible: true, editor_key: key, question_values: qv}); 
    }

    const configQList  = (key:string)  =>  {
      const lst  = config.editor_configs[key].question_values;
      setInputs({...inputs, question_values:  lst })
      setConfig({...config, qlist_visible: true, editor_key: key})
      
    }

    const fetchSaveVariables  =  async ()  =>  {

      const init = {
          method: "POST", 
          body: JSON.stringify({
              question_key: config.editor_key,
              variables: inputs.question_values

          })
      }
      
      const response  = await fetch(`http://localhost:8000/api/save_variables`, init );
      const json  = await response.json();

      return json;
    }

    const onSaveQList  = ()  =>  {
      fetchSaveVariables().then((data)   =>   {
        if(data == true){

          const ll = JSON.parse(JSON.stringify(config.editor_configs));
            ll[config.editor_key||''].question_values = inputs.question_values;

            setConfig({...config, editor_configs: ll});
            setInputs({...inputs, question_values: []});
          
          setConfig({...config, qlist_visible: false})
        }
      }).catch(  (error:any)  =>  {
        console.log(error);
        

      })     
      
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
                        <RightSquareOutlined key="run" onClick={ () => (setConfig({...config, company_visible: true, editor_key: 'simple_question'}))} />,
                        <SettingOutlined key="setting" onClick={ ()=> { configQList('simple_question') }} />,
                        <EditOutlined key="edit" onClick={() => { configEditor('simple_question') } }/>,
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

            <Modal title="Company question" open={config.company_visible} onOk={ onCompanyOk } okText="Run" destroyOnClose={false} onCancel={ () =>{ setConfig({...config, company_visible: false}) }} cancelText="CLose" width={650}>
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
                        <Upload accept='application/docx' action='http://localhost:8000/api/uploadfile/' ref={upload} onChange={onUploadChange}> PDF, DOCX, TXT files</Upload>
                    </Form.Item>

                </Form>
            </Modal>

            <Modal open={config.editor_visible} title="Template editor" width={1000} onCancel={ () => {setConfig({...config, editor_visible: false})  }} okText="Save" onOk={ onSaveEditor }>
                <Typography.Title level={5}>Template editor (Jinja2)</Typography.Title>
                <Row>
                <Col span={18}  >
                <AceEditor
                  mode="java"
                  theme="github"
                  onChange={ (value) =>  { setInputs({...inputs, editor: value}) } }
                  name="acedEditor"
                  editorProps={{ $blockScrolling: true }}
                  onSelectionChange={(selectionObj) => {
                    setConfig({...config, selection: selectionObj});
                    }}
                  commands={[{name: 'test', bindKey:{'mac':'Alt-N','win':'Alt-N'}, exec: (val)=>{ console.log(val)}}]}
                  setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: true
                  }}
                  value={inputs.editor}
                />
                </Col>
                <Col span={6}>
                
                {/* <Button onClick={  ()  =>   {
                  //console.log(config.selection)
                  config.selection.session.insert({row: config.selection.cursor.row,column: config.selection.cursor.column}, '{{ variable }}')
                }}>asdf</Button> */}

                  {
                    (config.question_values|| []).map((e:any, index:number)  => {
                      return (
                        <Button key={index} size="small" onClick={   ()=>  {config.selection.session.insert({row: config.selection.cursor.row,column: config.selection.cursor.column}, `{{ ${e.key} }}`)}    }>{e.variable}</Button>
                      )
                    })
                  }

                </Col>
                </Row>
                <Typography.Link href='https://jinja.palletsprojects.com/en/3.1.x/api/#basics' target='_blank'>Jinja 2 documentation</Typography.Link>
            </Modal>
            <Modal open={config.qlist_visible} title="Question list" width={800} onCancel={ ()  =>  setConfig({...config, qlist_visible: false})   } okText="Save" onOk={ onSaveQList  }>
                { inputs.question_values.length == 0?
                  <>
                  <Typography.Title level={5}>Question list is empty</Typography.Title>
                  <Button onClick={  ()=>  setInputs({...inputs, question_values: [{key: 'new_key', variable:  'new_value'}]})  }>New question</Button>
                  </>
                   :
                  inputs.question_values.map((e:any, index:number) => {
                  return (
                    <>
                   <Input key={'inp_key_'+index} size='small' style={{width: 100}} value={inputs.question_values[index].key} onChange={  (e:any)  =>  { const qv = JSON.parse(JSON.stringify(inputs.question_values)); 
                    qv[index].key = e.target.value; setInputs({...inputs, question_values: qv})} 
                    }/> 
                   <Input key={'inp_var_'+index} size="small"  style={{width: 200}} value={inputs.question_values[index].variable} onChange={  (e:any)  =>  {const qv = JSON.parse(JSON.stringify(inputs.question_values)); 
                    qv[index].variable = e.target.value; setInputs({...inputs, question_values: qv})}  
                    }/>
                    <Button key={'inp_btn_'+index} size="small" onClick={  ()=>  setInputs({...inputs, question_values: inputs.question_values.splice(index, 1)})   }><MinusOutlined /></Button>
                    <br />
                   </>
                  )
                  }).concat(
                    <>
                      <Divider />
                      <Button size="small" onClick={  ()=>  setInputs({...inputs, question_values: inputs.question_values.concat({key: 'new_key', variable:  'new_value'})})  }><PlusOutlined/></Button>
                    </>
                  )
            
                  
                 }
                
            </Modal>
            <Modal open={config.waiting_visible} confirmLoading={config.waiting_success}>
            </Modal>
        </>
    )
  }

export default Welcome