from rest_framework import serializers
from .models import Bid
from datetime import datetime
from auction.serializers import AuctionSerializer

class BidSerializer(serializers.ModelSerializer):
    auction_details = AuctionSerializer(source='auction', read_only=True)
    class Meta:
        model = Bid
        fields = ['id', 'send_date', 'event', 'platform', 'quantity', 'winner', 'auction', 'client', 'auction_details']

    def validate(self, data):
        """
        Comprobar que se ha hecho la puja a tiempo
        """

        print(data)
        if (datetime.now() < data['auction'].starting_date):
            raise serializers.ValidationError("The auction hasn't started yet")
        
        if (datetime.now() > data['auction'].end_date):
            raise serializers.ValidationError("The auction has finished already")
        
        bids = Bid.objects.filter(auction=data['auction'])

        if ((not bids.exists()) and data["quantity"] < data["auction"].starting_bid):
            raise serializers.ValidationError("The bid has to be greater than the starting amount")
        
        return data
        

