/*
Provided to you by Emlid Ltd (c) 2014.
twitter.com/emlidtech || www.emlid.com || info@emlid.com

Example: Receive position information with GPS driver onboard of Navio shield for Raspberry Pi.

Ublox GPS receiver is connected as an SPI device 0.0(/dev/spidev0.0).
The receiver sends information over SPI in an endless stream,
this program is intended to show, how to capture ubx protocol messages
from the stream and extract useful information from them.

To run this example navigate to the directory containing it and run following commands:
make
./ublox
*/

//#define _XOPEN_SOURCE 600
#include "Navio/Ublox.h"
#include <string.h>
#include <stdio.h>
#include <iostream>
#include <sstream>
#include <fstream>
#include <time.h>

using namespace std;

int run() {
    // This vector is used to store location data, decoded from ubx messages.
    // After you decode at least one message successfully, the information is stored in vector
    // in a way described in function decodeMessage(vector<double>& data) of class UBXParser(see ublox.h)

    std::vector<double> pos_data;
    std::vector<double> status_data;
    int pos_result;
    int status_result;


    // create ublox class instance
    Ublox gps;

    // Here we test connection with the receiver. Function testConnection() waits for a ubx protocol message and checks it.
    // If there's at least one correct message in the first 300 symbols the test is passed
    if(!gps.testConnection()) {
        printf("Ublox test not passed\nAbort program!\n");
        return 1;
    }

    time_t     now = time(0);
    struct tm  tstruct;
    char       buf[24];
    tstruct = *localtime(&now);
    // Visit http://en.cppreference.com/w/cpp/chrono/c/strftime
    // for more information about date/time format
    strftime(buf, sizeof(buf), "gps-%Y%m%d-%H%M%S.txt", &tstruct);
    ofstream ofs(buf, ios::app);

    if(!ofs.good()) {
        printf("Not able to open file to append to\n");
        return 1;
    } else {
        printf("Streaming to file: %s\n", buf);
    }

    ofs << "GPS Milliseconds;Longitude;Latitude;Height above Ellipsoid;Height above mean sea level;Hor Acc Est;Ver Acc Est" << endl;

    while (true)
    {
  			if(true || !ofs.good()) {
	   	  		ofstream ofs(buf, ios::app);
		  	}
			
        pos_result = gps.decodeSingleMessage(Ublox::NAV_POSLLH, pos_data);
        if(pos_result) {
            ofs << "gps=";
            ofs << (pos_data[0] / 1000) << ";"; // gps time
            ofs << (pos_data[1] / 10000000) << ";"; // longitude
            ofs << (pos_data[2] / 10000000) << ";"; // latitude
            ofs << (pos_data[3] / 1000) << ";"; // height ellipsoid
            ofs << (pos_data[4] / 1000) << ";"; // height sea level
            ofs << (pos_data[5] / 1000) << ";"; // horizontal acc
            ofs << (pos_data[6] / 1000); // vertical acc
            ofs << endl;
        }

        status_result = gps.decodeSingleMessage(Ublox::NAV_STATUS, status_data);        
        if(status_result) {
            ofs << "status=";
            switch((int)status_data[0]){
                case 0x00: ofs << "nofix"; break;
                case 0x01: ofs << "deadreckoning"; break;
                case 0x02: ofs << "2dfix"; break;
                case 0x03: ofs << "3dfix"; break;
                case 0x04: ofs << "gps+dr"; break;
                case 0x05: ofs << "timeonly"; break;
                default: ofs << "-"; break;
            }
            ofs << endl;
        }

        usleep(1000);                 
        ofs.flush();
    }

    ofs.close();

    return 0;
}

int main(int argc, char *argv[]){
	while(true){
		run();
		sleep 5;
	}
}