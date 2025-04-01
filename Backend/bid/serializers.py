from rest_framework import serializers
from .models import Bid
from datetime import datetime

class BidSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bid
        fields = '__all__'

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
    
        if (bids.exists() and max(bids, key=lambda obj: getattr(obj, 'quantity')).quantity >= data["quantity"]):
            raise serializers.ValidationError("The bid has to be greater than the previous")
        
        return data
        

