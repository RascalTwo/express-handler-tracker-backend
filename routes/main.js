const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");
const Data = require("../models/Data");
//Main Routes - simplified for now

function getUserFromWherever(req, res, next){
    const token = req.get('Authorization')?.split('Bearer ')[1] || req.query.token || req.body.token
    return User.findOne({ token }).then(u => {
        if (u) req.user = u
        next()
    }).catch(next)
}
router.get('/', getUserFromWherever, (req, res) => {
    res.send(req.user?.toObject() || {})
})
router.post('/', getUserFromWherever, (req, res) => {
    res.send(req.user?.toObject() || {})
})

router.post('/data/:owner/:repository/:slug', getUserFromWherever, async (req, res) => {
    const existing = await Data.findOne({ authorId: req.user.id, owner: req.params.owner, repository: req.params.repository, slug: req.params.slug })
    if (existing) {
        existing.content = req.body
        await existing.save()
        return res.send(existing.toObject())
    }

    const created = await Data.create({ authorId: req.user.id, owner: req.params.owner, repository: req.params.repository, slug: req.params.slug, content: req.body })
    return res.send(created.toObject())
})


router.delete('/data/:owner/:repository/:slug', getUserFromWherever, async (req, res) => {
    const existing = await Data.findOne({ authorId: req.user.id, owner: req.params.owner, repository: req.params.repository, slug: req.params.slug })
    if (existing) {
        await existing.remove()
        return res.send({});
    }

    return res.status(404).end();
})

router.get('/data/:owner?/:repository?/:authorId?/:slug?', async (req, res) => {
    const filter = {};
    if (req.params.owner) filter.owner = req.params.owner
    if (req.params.repository) filter.repository = req.params.repository
    if (req.params.authorId) filter.authorId = req.params.authorId
    if (req.params.slug) filter.slug = req.params.slug
    return res.send(await Data.find(filter, filter.slug ? { content: 1 } : {}).lean())
})

router.get('/author/:id', async (req, res) => {
    return res.send(await Data.find({ authorId: req.params.id }).lean())
})
router.get('/auth/github', (req, res, next) => {
    req.session.returnTo = req.query.returnTo
    next()
}, passport.authenticate('github'));
router.get('/auth/github/callback', (req, res, next) => {
    req.returnTo = req.session.returnTo
    next()
}, passport.authenticate('github', {
    failureRedirect: '/',
}), (req, res) => {
    if (req.returnTo) return res.redirect(req.returnTo + '?token=' + req.user.token);
    res.send("You are logged in, close this tab!")
});

module.exports = router;
