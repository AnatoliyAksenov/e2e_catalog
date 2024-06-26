import {useState, useRef, useEffect} from'react'
import {Layout, Button, Modal, Input, Checkbox, Slider, Form, Upload,  UploadFile, Card, Avatar, /*Table,*/ Row, Col, Typography, Divider} from 'antd'
import { useNavigate } from "react-router-dom"

import {SettingOutlined, EditOutlined, /*EllipsisOutlined,*/ RightSquareOutlined, PlusOutlined, MinusOutlined, InboxOutlined} from '@ant-design/icons';

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

//import target from '../../assets/target-svgrepo-com.svg'

const {Content} = Layout

const {Meta} = Card

const { Dragger } = Upload

interface EditorConfig{
  template: string,
  question_values: QVariable[],
  label: string,
  description: string,
}

interface Config{
    visible: boolean,
    editor_visible?: boolean,    
    editor_key?: string,
    use_internet?: boolean,
    use_closed_sources?: boolean,
    editor_configs: {[key: string]:EditorConfig},
    qlist_visible?: boolean,
    selection?: any,
    question_values?: QVariable[],
    company_visible?: boolean,
    waiting_visible?: boolean,
    waiting_success?: boolean,
    modal_waiting?: number,
}

interface QVariable{
  key: string,
  variable: string,
}

interface Inputs{
  question?: string, 
  temperature?: number, 
  editor?: string, 
  question_values?: QVariable[], 
  waiting_id?: number, 
  last_report_id?: number, 
  use_internet?: boolean, 
  get_results?: number, 
  editor_config?: any
}


const Welcome = () => {

    const navigate = useNavigate()

    const [config, setConfig]  =  useState<Config>({visible: false, editor_configs: {}})
    const [inputs, setInputs]   =  useState<Inputs>({} as Inputs)
    //const [items, setItems] = useState<any[]>([])

    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const upload = useRef<typeof Upload>(null)
    //const [form] =   Form.useForm()

    //const [questionTheme, setQuestionTheme] = useState('Финансы')


    const fetchQuestionsConfig  =  async ()  =>  {
      
      const response  = await fetch(`/api/questions_config` );
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
                question_key: config.editor_key,
                temperature: inputs.temperature,
                use_internet: config.use_internet,
                use_closed_sources: config.use_closed_sources,
                files: fileList.map((file) => file.response.key)

            })
        }
        
        const response  = await fetch(`/api/process_query`, init );
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
              use_closed_sources: config.use_closed_sources,
              get_results: inputs.get_results,
              files: fileList.map((file) => file.response.key)

          })
      }
      
      const response  = await fetch(`/api/company_query`, init );
      const json  = await response.json();

      return json;
    }

    const fetchQuestionStatus  =  async (id:any)  =>  {
      
      const response  = await fetch(`/api/question_status/${id}`  );
      const json  = await response.json();

      return json;
    }  

    useInterval(() => {
      if(!!inputs.waiting_id){
        
            fetchQuestionStatus(inputs.waiting_id).then((data)  => {

              if(data.status == 0){
                const nid = (config.modal_waiting || 0)+1

                setConfig({...config,  waiting_success: false, modal_waiting: nid})
                setInputs({...inputs, waiting_id: undefined})
               
              }
              if(data.status ==  500){
                console.log("Error: ", data)
                setInputs({...inputs, waiting_id: undefined, last_report_id: undefined})
              }
                
            }).catch( (error) => {
                console.log(error)
                setInputs({...inputs, waiting_id: undefined})
            })
      }

    }, 2000)

    const fetchSaveTemplate  =  async ()  =>  {

      const init = {
          method: "POST", 
          body: JSON.stringify({
              template_key: config.editor_key,
              template: inputs.editor

          })
      }
      
      const response  = await fetch(`/api/save_template`, init );
      const json  = await response.json();

      return json;
    }

    const onUploadChange = (info:any) => {
        console.log("onUploadChange: ", info);
        setFileList([...info.fileList]);
    };

    const onOk = () => {
        fetchNewQuestion().then((_data)  => {
            //setItems([...items,data as any])
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
            setConfig({...config, company_visible: false, waiting_visible: true, waiting_success: true, modal_waiting: 0}); 
            setInputs({...inputs, waiting_id: data.id, last_report_id: data.id});

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

              setConfig({...config, editor_configs: ll, editor_visible: false});
              setConfig({...config, editor_key: ''});
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
      const lst  = config.editor_configs[key].question_values || [];
      setInputs({...inputs, question_values:  lst })
      setConfig({...config, qlist_visible: true, editor_key: key})
      
    }

    const configRun =  (key:string)   =>   {
      const lst  = config.editor_configs[key]|| {};
      setInputs({...inputs, editor_config:  lst  })
      setConfig({...config, company_visible: true, editor_key: key})
    }

    const fetchSaveVariables  =  async ()  =>  {

      const init = {
          method: "POST", 
          body: JSON.stringify({
              question_key: config.editor_key,
              variables: inputs.question_values

          })
      }
      
      const response  = await fetch(`/api/save_variables`, init );
      const json  = await response.json();

      return json;
    }

    const onSaveQList  = ()  =>  {
      fetchSaveVariables().then((data)   =>   {
        if(data == true){

          const ll = JSON.parse(JSON.stringify(config.editor_configs));
            ll[config.editor_key||''].question_values = inputs.question_values;

            setConfig({...config, editor_configs: ll, qlist_visible: false});
            setInputs({...inputs, question_values: []});

        }
      }).catch(  (error:any)  =>  {
        console.log(error);
        
      })     
      
    }

    const onRemoveVariable = (index: number)   =>   {
      const qv = inputs.question_values || []
      qv.splice(index, 1)
      setInputs({...inputs, question_values: qv}) 
    }
    return (
        <>
            <Content>
                <h1>Задачи: <strong style={{color: 'white', backgroundColor: '#A0A0A0', padding: '2px'}}>E2E</strong>Каталог</h1>

                <Row justify="center" gutter={[16,16]}>
                    <Col>
                    <Card
                      style={{ width: 400, marginTop: 26 }}
                      actions={[
                        <RightSquareOutlined key="run" onClick={ () => ( configRun('simple_question') )} />,
                        <SettingOutlined key="setting" onClick={ ()=> { configQList('simple_question') }} />,
                        <EditOutlined key="edit" onClick={() => { configEditor('simple_question') } }/>,
                      ]}
                    >
                      
                        <Meta
                          avatar={<Avatar src={browse} style={{width: 90, height: 90}}/>}
                          title={ config.editor_configs['simple_question']?.label }
                          description={config.editor_configs['simple_question']?.description }
                        />
                     
                    </Card>
                    </Col>
                    <Col>
                    <Card
                      style={{ width: 400, marginTop: 26 }}
                      actions={[
                        <RightSquareOutlined key="run" onClick={ () => ( configRun('goods_analysis') )}/>,
                        <SettingOutlined key="setting" onClick={ ()=> { configQList('goods_analysis') }} />,
                        <EditOutlined key="edit" onClick={() => { configEditor('goods_analysis') } }/>,
                      ]}
                    >
                      
                        <Meta
                          avatar={<Avatar src={date} style={{width: 90, height: 90}}/>}
                          title={ config.editor_configs['goods_analysis']?.label }
                          description={config.editor_configs['goods_analysis']?.description }
                        />
                     
                    </Card>
                    </Col>
                    <Col>
                    <Card
                      style={{ width: 400, marginTop: 26 }}
                      actions={[
                        <RightSquareOutlined key="run" onClick={ () => {} }/>,
                        <SettingOutlined key="setting" />,
                        <EditOutlined key="edit" />,
                      ]}
                    >
                      
                        <Meta
                          avatar={<Avatar src={document} style={{width: 90, height: 90}}/>}
                          title={ config.editor_configs['chat']?.label }
                          description={config.editor_configs['chat']?.description }
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
                        <SettingOutlined key="setting" onClick={ ()=> { configQList('marketing_insides') }} />,
                        <EditOutlined key="edit" onClick={() => { configEditor('marketing_insides') } }/>,
                          ]}
                        >
                          
                            <Meta
                              avatar={<Avatar src={inspiration} style={{width: 90, height: 90}}/>}
                              title={ config.editor_configs['marketing_insides']?.label }
                              description={config.editor_configs['marketing_insides']?.description }
                            />
                         
                        </Card>
                    </Col>
                    <Col>
                    <Card
                      style={{ width: 400, marginTop: 26 }}
                      actions={[
                        <RightSquareOutlined key="run" />,
                        <SettingOutlined key="setting" onClick={ ()=> { configQList('Innovations') }} />,
                        <EditOutlined key="edit" onClick={() => { configEditor('Innovations') } }/>,
                      ]}
                    >
                      
                        <Meta
                          avatar={<Avatar src={picture} style={{width: 90, height: 90}}/>}
                          title={ config.editor_configs['Innovations']?.label }
                          description={config.editor_configs['Innovations']?.description }
                        />
                     
                    </Card>
                    </Col>
                </Row>

            </Content>
            <Modal title="New question" open={config.visible} onOk={ onOk } okText="Вперед" destroyOnClose={false} onCancel={ () =>{ setConfig({...config, visible: false}) }} cancelText="Закрыть" width={650}>
                <Form layout='horizontal'>
                    <Form.Item label="Question" labelCol={{span: 6}}   >
                    <Input placeholder="Введите ваш запрос" onChange={ (e:any) => setInputs({...inputs, question: e.target.value})}/>      
                    </Form.Item>
                    
                    <Form.Item label="Использовать интернет ресурсы"  labelCol={{span: 6}} >
                    <Checkbox value={config.use_internet} onChange={( e:any)  => setConfig({...config, use_internet: e.target.checked}) }>Использоваь интернет ресурсы</Checkbox>
                    </Form.Item>

                    <Form.Item label="Использовать закрытые источники"  labelCol={{span: 6}} >
                    <Checkbox checked={config.use_closed_sources} onChange={( e:any)  => setConfig({...config, use_closed_sources: e.target.checked}) }> Использовать закрытые источники</Checkbox>
                    </Form.Item>
    
                    <Form.Item label="Температута"  labelCol={{span: 6}} >
                      <Slider min={0.1} max={1} step={0.1} onChange={(e:any)  => setInputs({...inputs, temperature: e}) } defaultValue={.5} />
                    </Form.Item>

                    <Form.Item label="Текстовые ресурсы" getValueFromEvent={(e:any)   => setFileList(e.fileList)  }>
                        <Upload accept='application/docx' action='/api/uploadfile/' ref={upload} onChange={onUploadChange}> PDF, DOCX или TXT файлы</Upload>
                    </Form.Item>

                </Form>
            </Modal>

            <Modal title={ (inputs.editor_config ||{}).label || 'New request'} open={config.company_visible} onOk={ onCompanyOk } okText="Запуск" destroyOnClose={false} onCancel={ () =>{ setConfig({...config, company_visible: false}) }} cancelText="Закрыть" width={750}>
                <Form layout='horizontal'>
                    <Form.Item label="Запрос" labelCol={{span: 10}} tooltip="Введите детали запроса. Наименование компании, товара или отрасли для анализа">
                      <Input placeholder="Введите детали запроса" onChange={ (e:any) => setInputs({...inputs, question: e.target.value})}/>      
                    </Form.Item>
                    
                    <Form.Item label="Использовать интернет ресурсы"  labelCol={{span: 10}} >
                    <Checkbox checked={config.use_internet} onChange={( e:any)  => setConfig({...config, use_internet: e.target.checked}) }> Использовать интернет ресурсы</Checkbox>
                    </Form.Item>

                    <Form.Item label="Проверять источников"  labelCol={{span: 10}} >
                      <Slider min={1} max={10} step={1} onChange={(e:any)  => setInputs({...inputs, get_results: e}) } defaultValue={3} />
                    </Form.Item>

                    <Form.Item label="Использвоать закрытые источники"  labelCol={{span: 10}} >
                    <Checkbox checked={config.use_closed_sources} onChange={( e:any)  => setConfig({...config, use_closed_sources: e.target.checked}) }>Использовать закрытые источники</Checkbox>
                    </Form.Item>
    
                    <Form.Item label="Температура"  labelCol={{span: 10}} >
                      <Slider min={0.1} max={1} step={0.1} onChange={(e:any)  => setInputs({...inputs, temperature: e}) } defaultValue={.2} />
                    </Form.Item>

                    <Form.Item>
                        <Dragger  action='/api/uploadfile/' onChange={onUploadChange}>
                          <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                          </p>
                          <p className="ant-upload-text">Кликните или перетащите сюда файлы для загрузки</p>
                          <p className="ant-upload-hint">
                            Можно загружить любые форматы файлов, из которых может быть извлечен текст (кроме картинок).
                          </p>
                        </Dragger>
                        
                    </Form.Item>

                </Form>
            </Modal>

            <Modal open={config.editor_visible} title="Редактор шаблона" width={1000} onCancel={ () => {setConfig({...config, editor_visible: false})  }} okText="Сохранить" onOk={ onSaveEditor }>
                <Typography.Title level={5}>Редактор шаблонов (Jinja2)</Typography.Title>
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
                
                  <Typography.Title level={5}>Пользовательские поля</Typography.Title>
                  {
                    (config.question_values|| []).map((e:any, index:number)  => {
                      return (
                        <Button key={index} size="small" onClick={   ()=>  {config.selection.session.insert({row: config.selection.cursor.row,column: config.selection.cursor.column}, `{{ ${e.key}.answer }}`)}    }>{e.variable}</Button>
                      )
                    })
                  }
                  <Divider type='horizontal' />
                  <Typography.Title level={5}>Технические поля</Typography.Title>
                  {
                    [{variable: "ИНН компании", key: 'inn'}, {variable: "Использовался интернет", key:'use_internet'}, {variable:'Использовались закрытые источники',key:'use_closed_resources' }, {variable: "Запрос пользователя", key: 'query'}].map((e:any, index:number)  => {
                      return (
                        <Button key={index} size="small" onClick={   ()=>  {config.selection.session.insert({row: config.selection.cursor.row,column: config.selection.cursor.column}, `{{ ${e.key} }}`)}    }>{e.variable}</Button>
                      )
                    })
                  }

                </Col>
                </Row>
                <Typography.Link href='https://jinja.palletsprojects.com/en/3.1.x/api/#basics' target='_blank'>Jinja 2 документаця</Typography.Link>
            </Modal>
            <Modal open={config.qlist_visible} title="Параметры отчета" width={800} onCancel={ ()  =>  setConfig({...config, qlist_visible: false})   } okText="Save" onOk={ onSaveQList  }>
                { (inputs.question_values || []).length == 0?
                  <>
                  <Typography.Title level={5}>Пустой список</Typography.Title>
                  <Button onClick={  ()=>  setInputs({...inputs, question_values: [{key: 'ключ', variable:  'значение'}]})  }>Новый параметр</Button>
                  </>
                   :
                  (inputs.question_values || []).map((_e:any, index:number) => {
                  return (
                    <>
                   <Input key={'inp_key_'+index} size='small' style={{width: 200}} value={ (inputs.question_values || [])[index].key} onChange={  (e:any)  =>  { const qv = JSON.parse(JSON.stringify(inputs.question_values)); 
                    qv[index].key = e.target.value; setInputs({...inputs, question_values: qv})} 
                    }/> 
                   <Input key={'inp_var_'+index} size="small"  style={{width: 300}} value={ (inputs.question_values || [])[index].variable} onChange={  (e:any)  =>  {const qv = JSON.parse(JSON.stringify(inputs.question_values)); 
                    qv[index].variable = e.target.value; setInputs({...inputs, question_values: qv})}  
                    }/>
                    <Button key={'inp_btn_'+index} size="small" onClick={  ()=>  onRemoveVariable(index)  }><MinusOutlined /></Button>
                    <br />
                   </>
                  )
                  }).concat(
                    <>
                      <Divider />
                      <Button size="small" onClick={  ()=>  setInputs({...inputs, question_values: (inputs.question_values || []).concat({key: 'ключ', variable:  'значение'})})  }><PlusOutlined/></Button>
                    </>
                  )
            
                  
                 }
                
            </Modal>
            <Modal key={config.modal_waiting} open={config.waiting_visible} confirmLoading={config.waiting_success} okText="Перейти к отчету" onOk={ ()=> { navigate('/report_view',{state:{id: inputs.last_report_id}}) }} onCancel={ () => { setConfig({...config, waiting_visible: false}) }}>
              <Typography.Title level={4}>Состояние работы</Typography.Title>
              { config.waiting_success? <Typography.Title level={5}>Ожидание выполнения</Typography.Title>:
                                       inputs.last_report_id?<Typography.Link href={'api/question_pdf_report/'+inputs.last_report_id}>Скачать pdf</Typography.Link>: <Typography.Text>Error</Typography.Text>}
            </Modal>
        </>
    )
  }

export default Welcome