const { pool } = require("../config/db");

const getAuditConfig = async (req,res)=>{

  try{

    const { type,id } = req.query;

    if(!type || !id){
      return res.status(400).json({
        message:"type and id required"
      });
    }

    /* TEMPLATE */

    const [templates] = await pool.query(
      `SELECT id,name
       FROM templates
       WHERE entity_type = ?
       AND entity_id = ?
       AND deleted_at IS NULL
       LIMIT 1`,
      [type,id]
    );

    if(!templates.length){
      return res.json({
        data:{
          template_name:null,
          current_slot:null
        }
      });
    }

    const template = templates[0];

    /* CURRENT SLOT */

    const [slots] = await pool.query(
      `SELECT * FROM inspection_slots`
    );

    const now = new Date();
    const currentTime = now.toTimeString().slice(0,5);

    let currentSlot = null;

    for(const s of slots){

      const start = String(s.start_time).slice(0,5);
      const end = String(s.end_time).slice(0,5);

      if(currentTime >= start && currentTime <= end){
        currentSlot = s;
        break;
      }

    }

    res.json({
      data:{
        template_name: template.name,
        current_slot: currentSlot
      }
    });

  }
  catch(e){

    console.error(e);

    res.status(500).json({
      message:"Failed to load audit config"
    });

  }

};

module.exports = { getAuditConfig };