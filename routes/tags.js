const express = require('express');
const router = express.Router();
const moment = require('moment');
const { ObjectId } = require('mongodb');
const _ = require('lodash');
const { forIn } = require('lodash');

module.exports = (io, models) => {
  io.p2p.on('getTags', async (data) => {
    let tags = [];
    if('passport' in io.p2p.request.session) {
      if('user' in io.p2p.request.session.passport) {
        let setting = await models.settingModel.findOne({}).exec();
        let user =  await models.userModel.findOne({
          _id: new ObjectId(io.p2p.request.session.passport.user)
        }).exec();
        let settingIncluded = _.intersectionWith(user.tags, setting.settingTags, (uTag, sTag) => {
          return uTag.equals(sTag);
        });
        tags = await models.tagModel.find({}).sort({_id: 1}).exec();
        if(settingIncluded.length === 0) {
          tags = _.differenceWith(tags, setting.settingTags, (tag, sTag) => {
            return tag.equals(sTag);
          });
          let projectIncluded = _.intersectionWith(user.tags, setting.projectTags, (uTag, pTag) => {
            return uTag.equals(pTag);
          });
          if(projectIncluded.length === 0) {
            tags = _.differenceWith(tags, setting.projectTags, (tag, pTag) => {
              return tag.equals(pTag);
            });
          }
          let userIncluded = _.intersectionWith(user.tags, setting.userTags, (uTag, sTag) => {
            return uTag.equals(sTag);
          });
          if(userIncluded.length === 0) {
            tags = _.differenceWith(tags, setting.userTags, (tag, uTag) => {
              return tag.equals(uTag);
            });
          }
        }
      }
    }
    io.p2p.emit('getTags', tags);
    return;
  });

  io.p2p.on('addTag', async (data) => {
    if(io.p2p.request.session.status.type === 3) {
      await models.tagModel.create({ 
        tick: moment().unix(),
        name: data,
      });
      let tags = await models.tagModel.find({}).sort({_id: 1}).exec();
      io.p2p.emit('getTags', tags);
    }
    return;
  });

  io.p2p.on('checkTagUsers', async (data) => {
    if(io.p2p.request.session.status.type === 3) {
      let tags = _.map(data, (item) => {
        return new ObjectId(item);
      });
      let tagCount = await models.userModel.aggregate([
        {
          $match: {
            tags: { $in: tags }
          }
        },
        {
          $group: {
            _id: '$tags',
            count: { $addToSet: '$_id' }
          }
        },
        {
          $unwind: {
            path: '$_id',
            preserveNullAndEmptyArrays: false
          }
        }
      ]).exec();
      io.p2p.emit('checkTagUsers', tagCount);
    }
    return;
  });

  io.p2p.on('getsiteAdminUsers', async (data) => {
    let setting = await models.settingModel.findOne({}).exec();
    if(io.p2p.request.session.status.type === 3) {
      let user =  await models.userModel.findOne({
        _id: new ObjectId(io.p2p.request.session.passport.user)
      }).exec();
      let autherizedTags = _.intersectionWith(user.tags, setting.settingTags, (uTag, sTag) => {
        return uTag.equals(sTag);
      });
      let adminUsers = [];
      if(autherizedTags.length > 0) {
        for(let t = 0; t < data.length; t++) {
          let queryTag = data[t];
          for(let i = 0; i < setting[queryTag].length; i++) {
            let tag = (setting[queryTag])[i];
            let users = await models.userModel.find({
              tags: tag
            }).exec();
            for(let k = 0; k < users.length; k++) {
              let user = users[k];
              adminUsers.push(user);
            }
          }
        }
      }
      io.p2p.emit('getsiteAdminUsers', adminUsers);
    }
    return;
  });

  return router;
}
