#!/usr/bin/python
# -*- coding: utf-8 -*-

import requests
import json
import os

from datetime import datetime, timedelta, date
from bs4 import BeautifulSoup
from flask import Flask, redirect, url_for, render_template, request


def date_to_sncf_date(date):
    day  = str(date.day).zfill(2)
    month = str(date.month).zfill(2)
    return "%s%s" % (day, month)

def get_trains(origin, destination, date):
    url = "http://voyages-sncf.mobi/reservation/selectOD.action?selectv4="
    payload = {
        'originName': origin,
        'destinationName': destination,
        'outwardJourneyDate': date_to_sncf_date(date),
        'outwardJourneyHour': date.hour,
        'back': 0
    }
    r = requests.post(url, data=payload)
    soup =  BeautifulSoup(r.text)

    good_journey = lambda journey: len(journey.find_all("span")) == 5
    journeys = filter(good_journey, soup.find_all("div", class_="bk-dv"))

    res = []
    for j in journeys:
        spans = j.find_all("span")
        res.append((spans[0].text, spans[1].text, spans[3].text))
    return res


app = Flask(__name__)
@app.route("/<origin>/<destination>")
def get_trains_orig_dest(origin, destination):
    date_ = datetime.now() - timedelta(hours=1)
    url = url_for('get_trains_complete',
            origin=origin,
            destination=destination,
            day=date_.strftime("%d-%m-%Y"),
            hour=date_.hour)

    return redirect(url)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/<origin>/<destination>/<day>/<hour>")
def get_trains_complete(origin, destination, day, hour):
    today = date.today()
    today = datetime(today.year, today.month, today.day)
    if day == "auj":
        day = today
    elif day == "dem":
        day = today + timedelta(days=1)
    else:
        day = datetime.strptime(day, "%d-%m-%Y")
    date_ = day + timedelta(hours=int(hour.lstrip("0")) )

    kw = {}
    kw["origin"] = origin
    kw["destination"] = destination
    kw["date_"] = date_
    if "json" in request.args:
        trains = get_trains(origin, destination, date_)
        return json.dumps(trains)
    return render_template("trains.html", **kw)

if __name__ == "__main__":
    if os.environ.get("PORT"):
        debug=False
    else:
        debug=True

    app.run(debug=debug, port=int(os.environ.get("PORT", 5000)))
