<template>
    <div class="container" v-loading="loading" element-loading-text="加载中">
        <el-row>
            <el-col :span="18" :offset="3">
                <el-form><work-view :work="work" /></el-form>
                <el-row style="margin-top: 20px">
                    <el-divider />

                    <div id="commentList">
                        <el-skeleton
                            :rows="6"
                            animated
                            :loading="commentsLoading"
                            :count="3"
                            :throttle="300"
                        >
                            <template slot="template">
                                <div
                                    style="display: flex; align-items: center; margin-bottom: 16px"
                                >
                                    <el-skeleton-item variant="circle" />
                                    <el-skeleton-item
                                        variant="h3"
                                        style="width: 20%; margin-left: 10px"
                                    />
                                </div>
                                <el-skeleton-item
                                    variant="rect"
                                    style="margin-left: 47px; margin-bottom: 16px"
                                />
                                <el-skeleton-item
                                    variant="rect"
                                    style="margin-left: 47px; margin-bottom: 16px"
                                />
                                <el-skeleton-item
                                    variant="rect"
                                    style="margin-left: 47px; margin-bottom: 16px; width: 66%"
                                />
                            </template>
                            <slot>
                                <comment
                                    :comments-data="commentsData"
                                    ref="comment"
                                    @reloadComments="getComments"
                                    v-if="commentsData.comments"
                                    :position="{ workID: work._id, name: 'workID' }"
                                    :entry="dimensionName"
                                    :commentable="work.evaluatable"
                                    :starText="starText"
                                />
                            </slot>
                        </el-skeleton>
                    </div>
                </el-row>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import workView from "../work-view"
import { getWork } from "@/api/evaluation"
import { getComments } from "@/api/comments"
import Comment from "@/components/Comment"

export default {
    name: "ViewEvaluation",
    components: { workView, Comment },
    data() {
        return {
            workID: "",
            loading: false,
            work: {},
            dimensions: [],
            dimensionName: [],
            starText: [],
            commentsData: {},
            commentsLoading: true,
        }
    },
    created() {
        this.workID = this.$route.params["id"]
        this.getWork()
    },
    methods: {
        getWork() {
            this.loading = true
            let { workID } = this
            getWork({ workID })
                .then(res => {
                    let { work, dimensions } = res.data
                    this.work = work
                    this.dimensions = dimensions
                    this.dimensionName = dimensions.map(e => e.dimensionName)
                    this.starText = dimensions.map(e => e.starText)
                    this.loading = false

                    let io = new IntersectionObserver(
                        ([{ boundingClientRect, intersectionRatio }]) => {
                            if (intersectionRatio <= 0) {
                                return false
                            }
                            this.getComments()
                            io.disconnect()
                        }
                    )
                    // 6. 获取被监听元素
                    let commentList = document.getElementById("commentList")
                    // 7. 在观察对象上，监听 6 中获取的对象
                    io.observe(commentList)
                })
                .catch(err => {
                    console.log(err)
                })
        },
        getComments() {
            let { workID } = this
            this.commentsLoading = true

            getComments({ workID })
                .then(res => {
                    this.commentsData = res.data
                    this.commentsLoading = false
                })
                .catch()
        },
    },
}
</script>

<style lang="scss" scoped>
.container {
    min-height: 80vh;
    padding: 40px;
}
</style>

