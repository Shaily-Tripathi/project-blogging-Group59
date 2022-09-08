const authorModel = require("../models/authorModel")
const blogModel = require("../models/blogModel")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId //check whether the format or objectid is of 24 digit or not

const isValid = function (value) { //function to check entered data is valid or not
    if (typeof value == "string") {
        if (value.trim() === "") {
            return false
        } else { return true }
    } else { return false }
}

const isValidForArray = function (value) {      //function to check entered data in array is valid or not
    const newArr = []
    for (let i = 0; i < value.length; i++) {    //example :-   ["ghfgh","   ",56444,"freendon 1947,"ghhgf"]
        if (typeof value[i] == "string") {
            if (value[i].trimLeft() !== "") {
                newArr.push(value[i])
                console.log(value[i])
            }
        }
    }
    if (newArr.length == 0) { return false }
    else { return newArr }
}

// ----------------------------------------------------- createBlogs by body-----------done  done------------------------------------------

const createBlogs = async function (req, res) {
    try {
        let blog = req.body
        let tags = blog.tags
        const authorId = req.body.authorId
        console.log(tags);

        tags = isValidForArray(tags)
        blog.tags = tags
        console.log(tags);

        if (tags == false) return res.status(400).send({ status: false, msg: "Tag is required" })
        console.log(tags);

        if (Object.keys(blog).length == 0) return res.status(400).send({ status: false, msg: "blog is manadatory" })
        if (!authorId) return res.status(400).send({ msg: "id is mandatory" })
        const id = await authorModel.findById(authorId)
        if (!id) return res.status(404).send({ status: false, msg: "no Author is present for this Id" })
        const blogData = await blogModel.create(blog)
        return res.status(201).send({ status: true, data: blogData })
    }
    catch (err) {
        return res.status(500).send({ msg: err.message })
    }
}


// --------------------------------------------------- get Blogs by query--------------- done --done----------------------------------

const getBlogs = async function (req, res) {
    try {
        const q = req.query // it gives an object
        const temp = req.savedTemp
        // if (Object.keys(q) == 0) {
        //     const result = await blogModel.find({ isDeleted: false, isPublished: true })//.count()
        //     if (result.length == 0) return res.status(404).send({ status: false, msg: "no Data found" })

        //     return res.status(200).send({ status: true, data: result })
        // }
        // // -------------------------------- this is for query param --------------------------------
        // else {

        //     const temp = {}
        //     if (q.category && q.category.trim() !== "") { temp.category = q.category.trim() }

        //     if (q.authorId && q.authorId.trim() !== "") {
        //         if (!ObjectId.isValid(q.authorId.trim())) return res.status(400).send({ status: false, msg: "AuthorId is not valid" })
        //         temp.authorId = q.authorId.trim()
        //     }

        //     if (q.tags && q.tags.trim() !== "") { temp.tags = q.tags.trim() }

        //     if (q.subcategory && q.subcategory.trim() !== "") { temp.subcategory = q.subcategory.trim() }

        //     // console.log(Object.values(temp))
        //     if (Object.values(temp) == 0) return res.status(400).send({ status: false, msg: "please apply filter" })

        const result = await blogModel.find(temp).find({ isDeleted: true, isPublished: true })//.count()
        if (result.length == 0) return res.status(404).send({ status: false, msg: "no data found" })

        return res.status(200).send({ status: true, data: result })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


// --------------------------------------- deleteBlogs by param -------- done ---------------------------

const deleteBlogsByParam = async function (req, res) {
    try {
        const blogId = req.params.blogId

        // // if (!ObjectId.isValid(blogId)) return res.status(404).send({ status: false, msg: "format of id is wrong" })

        // const blog = await blogModel.findById(blogId).select({ isDeleted: 1, _id: 0 })

        // if (!blog) return res.status(404).send({ status: false, msg: "no data found" })

        // if (blog.isDeleted == true) return res.status(404).send({ status: false, msg: "already deleted" })

        await blogModel.findByIdAndUpdate(blogId, { isDeleted: true, deletedAt: Date.now() }, { new: true })
        return res.status(200).send({ status: true, msg: "blog deleted" })
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

// ---------------------------------------------- update Blogs by body ------------- done ----done-------------------------

const updateBlog = async function (req, res) {
    try {  //1
        let blogId = req.params.blogId;
        //Check object id is in correct format or not!!

        if (!ObjectId.isValid(blogId)) return res.status(400).send({ status: false, msg: "Blog id is invalid" })




        let requestBody = req.body;

        if (Object.keys(requestBody).length == 0) {
            return res.status(400).send({ status: false, msg: "Please provide blog details to update" });
        }




        let { title, body, tags, subcategory } = requestBody
        // console.log(tags);

        //check the entered data in body is valid string or not!!
        if (!isValid(title)) return res.status(400).send({ status: false, msg: "title in wrong format" })
        if (!isValid(body)) return res.status(400).send({ status: false, msg: "body in wrong format" })
        if (tags) {
            tags = isValidForArray(tags)
            if (tags == false) { return res.status(400).send({ status: false, msg: "Tag is required" }) }
        }
        if (subcategory) {
            subcategory = isValidForArray(subcategory)
            if (subcategory == false) { return res.status(400).send({ status: false, msg: "subcategory is required" }) }
        }


        let blog = await blogModel.findOne({ _id: blogId, isDeleted: true })//.select({isDeleted:1,_id:0})
        // console.log(blog);
        if (!blog) { return res.status(404).send({ status: false, msg: "No such blog present in DB or is already deleted" }) }

        //updates the blog by using the given data in body

        const updatedBlog = await blogModel.findOneAndUpdate(
            { _id: blogId },
            {
                title: title,
                body: body,
                $addToSet: { tags: tags, subcategory: subcategory },
                isPublished: true,
                publishedAt: new Date()
            },
            { new: true });

        return res.status(200).send({ status: true, message: "Successfully updated blog details", data: updatedBlog, });


    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }

};

// --------------------------------------- deleteBlogs by Qyery ---------- done --done-----------------------


let deleteBlogsByQuery = async function (req, res) {
    try {

        const temp = req.savedTemp
        // let q = req.query
        // if (Object.keys(q) == 0) return res.status(400).send({ status: false, msg: "please apply filter" })

        // const temp = {}
        // if (q.category && q.category.trim() !== "") { temp.category = q.category.trim() }

        // if (q.authorid && q.authorid.trim() !== "") {
        //     if (!ObjectId.isValid(q.authorid.trim())) return res.status(400).send({ status: false, msg: "AuthorId is not valid" })
        //     temp.authorId = q.authorid.trim()
        // }

        // if (q.tags && q.tags.trim() !== "") { temp.tags = q.tags.trim() }

        // if (q.subcategory && q.subcategory.trim() !== "") { temp.subcategory = q.subcategory.trim() }

        // if (q.unpublished && q.unpublished.trim() !== "") {
        //     if (q.unpublished.trim() == "false") {
        //         temp.isPublished = false
        //     } else { temp.isPublished = true }
        // }

        // if (Object.values(temp) == 0) return res.status(400).send({ status: false, msg: "please apply filter" })

        const toBeDeleted = await blogModel.find(temp).select({ isDeleted: 1, _id: 0 })

        if (toBeDeleted.length == 0) return res.status(404).send({ status: false, msg: "no data found" })

        for (let i = 0; i < toBeDeleted.length; i++) {
            if (toBeDeleted[i].isDeleted == false) {
                temp.isDeleted = false
            }
        }
        if (temp.isDeleted != false) return res.status(404).send({ status: false, msg: "already Deleted" })

        await blogModel.updateMany(temp, { isDeleted: true, deletedAt: Date.now() }, { new: true })
        return res.status(200).send({ status: true })
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


module.exports.createBlogs = createBlogs
module.exports.getBlogs = getBlogs
module.exports.deleteBlogsByParam = deleteBlogsByParam
module.exports.deleteBlogsByQuery = deleteBlogsByQuery
module.exports.updateBlog = updateBlog
module.exports.isValid = isValid
module.exports.isValidForArray = isValidForArray