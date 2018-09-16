import React from 'react'
import { Checkbox} from 'antd';
import classnames from 'classnames';
import utils from './utils';
import './index.css'

const treeData = [{
  title: '品种1',
  key: '1000',
  type: 'node',
  children: [
    {
      title: '首页',
      key: '1001',
      type: 'route'
    },
    {
      title: '文章',
      key: '1002',
      type: 'route',
      children: [
        { title: '编辑', key: '1003', type: 'action' },
        { title: '删除', key: '1004', type: 'action' },
        {
          title: '评论',
          key: '1005',
          type: 'route',
          children: [
            { title: 'aa', key: '1013', type: 'action' },
            { title: 'bb', key: '1014', type: 'action' },
          ]
        },
        {
          title: '测试',
          key: '1205',
          type: 'route',
        },
      ],
    },
    {
      title: '菊花管理',
      key: '1006',
      type: 'route',
      children: [
        { title: '增', key: '1007', type: 'action' },
        { title: '删', key: '1008', type: 'action' },
        { title: '改', key: '1009', type: 'action' },
      ],
    }],
},{
    title: '培训菊花管理222',
    key: '1206',
    type: 'route',
}]

let defaultChecked = [1206, '1008', '1013'];

class Node extends React.Component{

  onChange = (e) => {
    const { changeChild, changeFather} = this.props;
    let checked = e.target.checked;
    let key = this.props.node.key;

    changeChild && changeChild(key, checked);
    changeFather && changeFather(key, checked);
  }

  render(){
    const { node, children} = this.props;
    const { title, checked, indeterminate } = node;
    const cls = classnames({
      node: true,
      right: node.type === 'action'
    })
    return (
      <div className={cls}>
        <Checkbox
          checked={checked}
          onChange={this.onChange}
          indeterminate={indeterminate}
        >
          {title}
        </Checkbox>
        {children}
      </div>
    )
  }
}

class Tree extends React.Component{
  constructor(props){
    super(props);
    let { data, leaf} = this.initData(treeData, defaultChecked);

    

    this.state = {
      data: data,
      leaf: leaf
    }
  }

  componentDidMount(){
    console.log(this.getNode('1014'));
    const {leaf} = this.state;
    const data = clone(this.state.data);
    for (const node of leaf) {
      this.siftUp(node, data);
    }
    this.setState({
      data
    })

  }

  initData(treeData, defaultChecked){
    let arr = [];
    let leaf = [];

    for (let i = 0; i < treeData.length; i++) {
      arr.push(this._initData(treeData[i], defaultChecked, leaf))      
    }
    console.log(arr);
    
    return {
      data: arr,
      leaf: leaf
    };
  }

  _initData(json, defaultChecked, leaf){
    let key = json.key;
    json.checked = defaultChecked.has(key);

    let children = json.children
    if (children && children.length){
      let arr = [];
      for (const child of children) {
        child.parentKey = json.key
        arr.push(this._initData(child, defaultChecked, leaf))
      }
      json.children = arr;
    }
    else{
      leaf.push(json);
    }

    return json;
  }

  getCheckList(){
    let {data} = this.state;

    let res = [];
    for (const json of data) {
      this._getCheckList(json, res);
    }

    return res;
  }

  _getCheckList(json, res){
    let children = json.children;

    if(children && children.length){
      for (const child of children) {
        this._getCheckList(child, res);
      }
    }

    if(json.checked){
      res.push(json.key);
    }
  }

  _getNode(json, key, res){
    if(json.key === key){
      res.push( json );
    }

    let children = json.children;
    if(children && children.length){
      for (const child of children) {
        this._getNode(child, key, res)
      }
    }
  }

  getNode = (key, cloneData) =>{
    const data = cloneData || this.state.data
    let res = [];
    for (const json of data) {
      this._getNode(json, key, res);
    }
    return res[0];
  }

  siftUp(node, cloneData){
    const data = cloneData || this.state.data;
    this._siftUp(node, data);
  }

  _siftUp(node, data){
    let parent = this.getNode(node.parentKey);

    if(!parent){
      return;
    }

    this.checkIndeterminate(parent)
    this._siftUp(parent, data);
  }

  checkIndeterminate(parent){
    let children = parent.children;
    let len = children.length;
    let count = 0;
    let indeterminates = 0;
    for (const child of children) {
      if (child.checked) count++;
      if (child.indeterminate) indeterminates++;
    }
    if (len === count) {
      parent.checked = true;
      parent.indeterminate = false;
    }
    else {
      parent.checked = false;

      if (count > 0 || indeterminates > 0) {
        parent.indeterminate = true;
      }
      else {
        parent.indeterminate = false;
      }
    }
  }

  changeChild = (key, checked) => {
    const data = clone(this.state.data);

    let node = this.getNode(key, data);
    node.checked = checked;

    this.siftUp(node, data);
    console.log(data);
    
    
    this.setState({
      data: data
    })

    let res = this.getCheckList();
    console.log(res);
  }

  changeFather = (key, checked) => {

  }

  renderNode(){
    const {data} = this.state;
    
    let arr = [];
    for (let i = 0; i < data.length; i++) {
      arr.push(this._renderNode(data[i]))
    }
    return arr;
  }

  _renderNode(node){
    if(node.children && node.children.length > 0){
      let children = [];
      for (let i = 0; i < node.children.length; i++) {
        const element = node.children[i];
        if (element.type === 'action'){
          children.unshift(this._renderNode(element))
        }
        else{
          children.push(this._renderNode(element))
        }
      }
      return (
        <Node
          node={node}
          key={node.key}
          changeFather={this.changeFather}
        >{children}</Node>
      )
    }
    else{
      return (
        <Node
          changeChild={this.changeChild}
          node={node}
          key={node.key} />
      )
    }
  }

  render(){
    return (
      <div>
        {this.renderNode()}
      </div>
    )
  }
}

function clone(arr){
  let res = [];
  for (const json of arr) {
    res.push(_clone(json, res))
  }
  return res;
}

function _clone(json, res){
  let children = json.children;

  if(children && children.length){
    let arr = [];
    for (const child of children) {
      arr.push(_clone(child, res))
    }
    json.children = arr;
  }

  return json;
}

export default Tree;