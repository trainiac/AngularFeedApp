#!/usr/bin/env python

import os.path
import sys

sys.path.append(os.path.abspath(os.path.pardir))

import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
from tornado.options import define, options
import json

define("port", default=8080, help="run on the given port", type=int)

# NOTE: This is a DUMMY BACKEND for testing. Please never write a production backend this way.

class Application(tornado.web.Application):
    def __init__(self):
        web_handlers = [
            (r"/feed", FeedHandler),
            (r"/item", ItemHandler),
            (r"/item/add_comment", AddCommentHandler),
            (r"/static/(.*)", tornado.web.StaticFileHandler, {"path": "static"}),
        ]

        tornado_settings = dict()
        tornado.web.Application.__init__(self, web_handlers, **tornado_settings)


class BaseHandler(tornado.web.RequestHandler):
    def write_json(self, response_dict={}):
        self.add_header("Content-Type", "application/json")

        json_out = json.dumps(response_dict, indent=3)
        self.write(json_out)
        self.mc_json_size = len(json_out)
        self.finish()


class FeedHandler(BaseHandler):
    def get(self):
        feed_data = load_data()
        self.write_json(feed_data)


class ItemHandler(BaseHandler):
    def get(self):
        item_id = self.get_argument("id")
        item_dict = get_item(item_id)

        self.write_json(item_dict)


class AddCommentHandler(BaseHandler):
    def post(self):
        item_id = self.get_argument("id")
        comment_author_id = self.get_argument("author_id")
        comment_text = self.get_argument("text")
        status = 0
        comment = {}

        feed_data = load_data()
        items = feed_data.get("items")
        if items:
            for item in items:
                if item["item_id"] == item_id:
                    comment = {
                        "author_id": comment_author_id,
                        "comment": comment_text,
                    }

                    item["comments"].append(comment)

                    save_data(feed_data)
                    status = 1

        self.write_json({
            "status": status,
            "comment": comment,
        })


def save_data(new_data):
    f = open("data.json", 'w')
    json.dump(new_data, f)
    f.close()

def load_data():
    f = open("data.json", "r")
    feed_data = json.load(f)
    f.close()

    return feed_data


def get_item(item_id):
    item_dict = {}
    feed_data = load_data()
    items = feed_data.get("items")

    the_item = None
    for item in items:
        if item["item_id"] == item_id:
            the_item = item
            break

    if the_item:
        author_ids = [the_item["author_id"]]
        comments = the_item.get("comments", [])
        for comment in comments:
            author_ids.append(comment["author_id"])

        people = feed_data.get("people")
        item_people = []

        for person in people:
            if person["id"] in author_ids:
                item_people.append(person)

        item_dict = {
            "item": the_item,
            "people": item_people,
        }

    return item_dict


def main():
    tornado.options.parse_command_line()
    server = tornado.httpserver.HTTPServer(Application())
    server.listen(options.port)
    loop = tornado.ioloop.IOLoop.instance()
    loop.start()


if __name__ == "__main__":
    main()