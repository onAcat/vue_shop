<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区 -->
        <el-card class="box-card">
            <el-row :gutter="20">
                <el-col :span="8">
                    <!-- 搜索与添加区域 -->
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- 用户列表区 -->
            <el-table :data="userlist" stripe border>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <el-table-column label="状态" >
                    <template slot-scope="scope">
                         <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch> 
                        
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
                        <!-- 分配角色按钮 -->
                        <el-tooltip  effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[1, 2, 5, 10]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加用户的对话框 -->
        <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed">
        <!-- 内容主体区 -->
        <span>
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px" >
            <el-form-item label="用户名" prop="username">
                <el-input v-model="addForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password" >
                <el-input v-model="addForm.password" type="password"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="addForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机" prop="mobile">
                <el-input v-model="addForm.mobile"></el-input>
            </el-form-item>
            </el-form>
        </span>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
        </el-dialog>
        <!-- 修改用户的对话框 -->
        <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed">
        <!-- 对话框主体区域 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
            <el-form-item label="用户名">
                <el-input v-model="editForm.username" disabled></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="editForm.email"></el-input>
            </el-form-item>
            <el-form-item label="电话" prop="mobile">
                <el-input v-model="editForm.mobile"></el-input>
            </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        //验证手机号码的规则
        var checkMobile = (rule, value, cb) => {
            const regMobile = /^1[34578]\d{9}$/
            if (regMobile.test(value)) {
            return cb()
            }
            //返回一个错误提示
            cb(new Error('请输入合法的手机号码'))
        }
        return {
            // 获取用户列表的参数对象
            queryInfo: {
                query: '',
                // 当前的页数
                pagenum: 1,
                // 当前每页显示多少条数据
                pagesize: 2

            },
            userlist:[],
            total:0,
            // 控制用户对话框的显示与隐藏
            addDialogVisible:false,
            editDialogVisible:false,
            // 添加用户的表单数据
            addForm: {
                username:'',
                password:'',
                email:'',
                mobile:''
            },
            // 修改用户表单数据
            editForm: {

            },
            // 添加表单的验证规则对象
            addFormRules:{
                 //验证用户名是否合法
                username: [
                    { required: true, message: '请输入登录名称', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                 //验证密码是否合法
                password: [
                    { required: true, message: '请输入登录名称', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                ],
                email:[
                    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
                    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
                ],
                mobile: [
                    { required: true, message: '请输入手机号码', trigger: 'blur' },
                    { validator:checkMobile, message: '手机号码不正确，请重新输入', trigger: 'blur'}
                ]
            },
            editFormRules:{
                email:[
                    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
                    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
                ],
                 mobile: [
                    { required: true, message: '请输入手机号码', trigger: 'blur' },
                    { validator:checkMobile, message: '手机号码不正确，请重新输入', trigger: 'blur'}
                ]
            }
        }
    },
    created() {
        this.getUserList()
    },
    methods: {
        async getUserList() {
            const {data: res} = await this.$http.get('users',{ params: this.queryInfo })
            if(res.meta.status !== 200) {
                return this.$message.error('获取用户列表失败！');
            }
            this.userlist = res.data.users
            this.total = res.data.total
            console.log(res)
        },
        // 监听pagesize改变的事件
        handleSizeChange(newSize) {
            console.log(newSize)
            this.queryInfo.pagesize = newSize
            this.getUserList()
        },
        // 监听页码值改变事件
        handleCurrentChange(newPage) {
            console.log(newPage)
            this.queryInfo.pagenum = newPage
            this.getUserList()
        },
        // 监听switch 开关状态
        async userStateChanged(row) {
        //发送请求进行状态修改
        const { data: res } = await this.$http.put(
            `users/${row.id}/state/${row.mg_state}`
        )
        //如果返回状态为异常状态则报错并返回
        if (res.meta.status !== 200) {
            row.mg_state = !row.mg_state
            return this.$message.error('修改状态失败')
        }
        this.$message.success('更新状态成功')
        },
        // 监听添加用户对话框的关闭事件
        addDialogClosed() {
            this.$refs.addFormRef.resetFields()
        },
        // 点击按钮添加用户
         addUser(){
            //点击确定按钮，添加新用户
            //调用validate进行表单验证
            this.$refs.addFormRef.validate( async valid => {
                if(!valid) return this.$message.error("请填写完整用户信息");
                //发送请求完成添加用户的操作
                const {data:res} = await this.$http.post("users",this.addForm)
                //判断如果添加失败，就做提示
                if (res.meta.status !== 201)
                    return this.$message.error('添加用户失败')
                //添加成功的提示
                this.$message.success("添加用户成功")
                //关闭对话框
                this.addDialogVisible = false
                //重新请求最新的数据
                this.getUserList()
            })
        },
        //展示编辑用户的对话框
        async showEditDialog(id) {
            //发送请求根据id获取用户信息
            const { data: res } = await this.$http.get('users/' + id)
            //判断如果添加失败，就做提示
            if (res.meta.status !== 200) return this.$message.error('获取用户信息失败')
            //将获取到的数据保存到数据editForm中
            this.editForm = res.data
            //显示弹出窗
            this.editDialogVisible = true
        },
        editDialogClosed(){
            //对话框关闭之后，重置表达
            this.$refs.editFormRef.resetFields()
        },
        // 修改用户信息并提交
        editUserInfo() {
            //用户点击修改表单中的确定按钮之后，验证表单数据
            this.$refs.editFormRef.validate(async valid => {
            if (!valid) return this.$message.error('请填写完整用户信息')
            //发送请求完成修改用户的操作
            const { data: res } = await this.$http.put(
                'users/' + this.editForm.id,
                this.editForm
            )
            //判断如果修改失败，就做提示
            if (res.meta.status !== 200) return this.$message.error('修改用户失败')
            //修改成功的提示
            this.$message.success('修改用户成功')
            //关闭对话框
            this.editDialogVisible = false
            //重新请求最新的数据
            this.getUserList()
            })
        },
        async removeUserById(id){
            //弹出确定取消框，是否删除用户
            const confirmResult = await this.$confirm('请问是否要永久删除该用户','删除提示',{
            confirmButtonText:'确认删除',
            cancelButtonText:'取消',
            type:'warning'
            }).catch(err=>err)
            //如果用户点击确认，则confirmResult 为'confirm'
            //如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
            if(confirmResult != "confirm"){
                return this.$message.info("已经取消删除")
            }
            //发送请求根据id完成删除操作
            const {data:res} = await this.$http.delete('users/'+id)
            //判断如果删除失败，就做提示
            if (res.meta.status !== 200) return this.$message.error('删除用户失败')
            //修改成功的提示
            this.$message.success('删除用户成功')
            //重新请求最新的数据
            this.getUserList()
        }
    }
}
</script>

<style lang="less" scoped>

</style>