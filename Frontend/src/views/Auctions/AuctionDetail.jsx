import { useEffect, useState } from "react";
import { getFromApi } from "../../utils/functions/api";


const AuctionDetail =  () => {
    const [auction, setAuction] = useState([])
    const [bids, setBids] = useState([])

    useEffect(() => {
        getFromApi("/auctions/")
    })
}

export default AuctionDetail;